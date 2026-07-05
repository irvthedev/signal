"use client";
import { NewsItem } from "@/lib/api";
import { ExternalLink } from "lucide-react";

const SOURCE_COLOR: Record<string, string> = {
  "BioPharma Dive": "text-blue-600 dark:text-blue-400",
  "Endpoints News": "text-purple-600 dark:text-purple-400",
  "STAT News":      "text-green-600 dark:text-green-400",
  "FiercePharma":   "text-orange-600 dark:text-orange-400",
};

function relTime(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NewsFeed({ news, loading }: { news: NewsItem[]; loading?: boolean }) {
  if (loading || !news.length) {
    return <p className="text-gray-400 text-sm dark:text-gray-500">Loading news...</p>;
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
      {news.map((n, i) => (
        <a
          key={n.url ?? i}
          href={n.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors group dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-500"
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${SOURCE_COLOR[n.source] ?? "text-gray-500 dark:text-gray-400"}`}>
              {n.source}
            </span>
            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-600">
              <span className="text-xs" suppressHydrationWarning>{relTime(n.published)}</span>
              <ExternalLink size={11} className="group-hover:text-gray-600 transition-colors dark:group-hover:text-gray-400" />
            </div>
          </div>
          <p className="text-gray-900 text-sm leading-snug font-medium mb-1 dark:text-white">{n.title}</p>
          {n.summary && (
            <p className="text-gray-500 text-xs leading-snug line-clamp-2 dark:text-gray-400">{n.summary}</p>
          )}
        </a>
      ))}
    </div>
  );
}
