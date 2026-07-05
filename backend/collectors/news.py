import logging
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
import feedparser
import requests
from cache import store
from config import ALL_COMPANIES, RSS_FEEDS, CACHE_TTL

log = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

COMPANY_TERMS: set[str] = set()
for c in ALL_COMPANIES:
    COMPANY_TERMS.add(c["ticker"].lower())
    for word in c["name"].lower().split():
        if len(word) > 3:
            COMPANY_TERMS.add(word)

MAX_AGE_HOURS = 48


class _Stripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self._parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self._parts.append(data)


def _strip_html(raw: str) -> str:
    s = _Stripper()
    s.feed(raw)
    text = " ".join(s._parts)
    return re.sub(r"\s+", " ", text).strip()


def _is_relevant(text: str) -> bool:
    t = text.lower()
    return any(term in t for term in COMPANY_TERMS)


def _parse_published(entry) -> str | None:
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat()
    return None


def _age_hours(entry) -> float:
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        return (datetime.now(timezone.utc) - dt).total_seconds() / 3600
    return 0


def fetch() -> list[dict]:
    seen_urls: set[str] = set()
    articles: list[dict] = []

    with requests.Session() as session:
        session.headers.update(HEADERS)
        for feed_meta in RSS_FEEDS:
            try:
                resp = session.get(feed_meta["url"], timeout=15)
                resp.raise_for_status()
                # Pass raw bytes + response URL so feedparser resolves relative links
                feed = feedparser.parse(resp.content, response_headers={"Content-Location": feed_meta["url"]})
                for entry in feed.entries:
                    url = entry.get("link", "")
                    if not url or url in seen_urls:
                        continue
                    if _age_hours(entry) > MAX_AGE_HOURS:
                        continue
                    text = entry.get("title", "") + " " + entry.get("summary", "")
                    if not _is_relevant(text):
                        continue
                    seen_urls.add(url)
                    articles.append({
                        "source": feed_meta["name"],
                        "title": _strip_html(entry.get("title", "")),
                        "summary": _strip_html(entry.get("summary", ""))[:300],
                        "url": url,
                        "published": _parse_published(entry),
                    })
            except Exception as e:
                log.warning("RSS fetch failed for %s: %s", feed_meta["name"], e)

    articles.sort(key=lambda x: x.get("published") or "", reverse=True)
    store.set("news", articles, CACHE_TTL["news"])
    log.info("Fetched %d pharma news articles", len(articles))
    return articles
