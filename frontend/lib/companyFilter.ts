import type { StockItem, NewsItem } from "@/lib/api";

const SUFFIX_RE = /,?\s+(inc\.?|incorporated|corp\.?|corporation|ltd\.?|limited|plc|n\.v\.|ag|co\.?)$/i;

function cleanName(name: string): string {
  return name.replace(SUFFIX_RE, "").trim();
}

export function resolveTicker(query: string, stocks: StockItem[]): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const byTicker = stocks.find(s => s.ticker.toLowerCase() === q);
  if (byTicker) return byTicker.ticker;

  const byExactName = stocks.find(s => s.name.toLowerCase() === q);
  if (byExactName) return byExactName.ticker;

  const byNameStart = stocks.find(s => s.name.toLowerCase().startsWith(q));
  if (byNameStart) return byNameStart.ticker;

  const byNameIncludes = stocks.find(s => s.name.toLowerCase().includes(q));
  if (byNameIncludes) return byNameIncludes.ticker;

  return null;
}

export function companyMatchesNews(company: StockItem, item: NewsItem): boolean {
  const text = `${item.title} ${item.summary}`.toLowerCase();

  const name = cleanName(company.name).toLowerCase();
  if (name && text.includes(name)) return true;

  const tickerRe = new RegExp(`\\b${company.ticker}\\b`, "i");
  return tickerRe.test(`${item.title} ${item.summary}`);
}
