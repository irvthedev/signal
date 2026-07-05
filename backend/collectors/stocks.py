import logging
import yfinance as yf
from cache import store
from config import ALL_COMPANIES, CACHE_TTL

log = logging.getLogger(__name__)

TICKERS = [c["ticker"] for c in ALL_COMPANIES]


def fetch() -> list[dict]:
    tickers_str = " ".join(TICKERS)
    result = []
    try:
        data = yf.Tickers(tickers_str)
        for company in ALL_COMPANIES:
            t = company["ticker"]
            try:
                info = data.tickers[t].fast_info
                price = info.last_price
                prev_close = info.previous_close
                change_pct = ((price - prev_close) / prev_close * 100) if prev_close else 0
                market_cap = getattr(info, "market_cap", None)
                result.append({
                    "ticker": t,
                    "name": company["name"],
                    "price": round(price, 2) if price else None,
                    "change_pct": round(change_pct, 2),
                    "prev_close": round(prev_close, 2) if prev_close else None,
                    "market_cap": market_cap,
                    "category": "top_pharma" if company in __import__("config").TOP_PHARMA else "biotech",
                })
            except Exception as e:
                log.warning("Stock fetch failed for %s: %s", t, e)
                result.append({"ticker": t, "name": company["name"], "price": None, "change_pct": 0, "error": str(e)})
    except Exception as e:
        log.error("yfinance batch fetch failed: %s", e)
    store.set("stocks", result, CACHE_TTL["stocks"])
    return result
