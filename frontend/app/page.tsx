"use client";

import { useEffect, useState, useCallback } from "react";
import { getStocks, getTrials, getPipeline, getNews } from "@/lib/api";
import type { StockItem, TrialItem, Pipeline, NewsItem } from "@/lib/api";
import StockGrid from "@/components/StockGrid";
import TrialFeed from "@/components/TrialFeed";
import PipelineView from "@/components/PipelineView";
import NewsFeed from "@/components/NewsFeed";
import ThemeToggle from "@/components/ThemeToggle";
import { RefreshCw, Activity } from "lucide-react";

const REFRESH_MS = 2 * 60 * 1000;

type Tab = "pipeline" | "trials";

export default function Dashboard() {
  const [stocks, setStocks]     = useState<StockItem[]>([]);
  const [trials, setTrials]     = useState<TrialItem[]>([]);
  const [pipeline, setPipeline] = useState<Pipeline>({});
  const [news, setNews]         = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>("pipeline");

  const refresh = useCallback(async () => {
    try {
      const [s, t, p, n] = await Promise.allSettled([
        getStocks(), getTrials(), getPipeline(), getNews(),
      ]);
      if (s.status === "fulfilled") setStocks(s.value);
      if (t.status === "fulfilled") setTrials(t.value);
      if (p.status === "fulfilled") setPipeline(p.value);
      if (n.status === "fulfilled") setNews(n.value);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-cyan-500 dark:text-cyan-400" />
          <span className="text-lg font-bold tracking-tight">Signal</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {loading && <RefreshCw size={14} className="animate-spin text-cyan-500 dark:text-cyan-400" />}
          {lastUpdated && <span>Updated {fmtTime(lastUpdated)}</span>}
          <button
            onClick={refresh}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors text-xs dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main grid — pipeline/trials | stocks | news */}
      <div className="grid grid-cols-12 gap-0 h-[calc(100vh-56px)]">

        {/* Stocks — center */}
        <aside className="col-span-3 border-r border-gray-200 p-4 overflow-y-auto dark:border-gray-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 dark:text-gray-500">Stocks</h2>
          {stocks.length ? (
            <StockGrid stocks={stocks} />
          ) : (
            <p className="text-gray-400 text-sm dark:text-gray-600">Loading...</p>
          )}
        </aside>

        {/* Pipeline / Trials — left */}
        <main className="col-span-5 border-r border-gray-200 flex flex-col dark:border-gray-800">
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setTab("pipeline")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === "pipeline"
                  ? "text-cyan-500 border-b-2 border-cyan-500 dark:text-cyan-400 dark:border-cyan-400"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setTab("trials")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === "trials"
                  ? "text-cyan-500 border-b-2 border-cyan-500 dark:text-cyan-400 dark:border-cyan-400"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
            >
              Trial Readouts
            </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            {tab === "pipeline" ? (
              <PipelineView pipeline={pipeline} />
            ) : (
              <TrialFeed trials={trials} />
            )}
          </div>
        </main>

        {/* News — right */}
        <aside className="col-span-4 p-4 overflow-y-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 dark:text-gray-500">Industry News</h2>
          <NewsFeed news={news} />
        </aside>
      </div>

      <ThemeToggle />
    </div>
  );
}
