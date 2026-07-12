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
  const [stocksLoading, setStocksLoading]     = useState(true);
  const [trialsLoading, setTrialsLoading]     = useState(true);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [newsLoading, setNewsLoading]         = useState(true);
  const [tab, setTab]           = useState<Tab>("pipeline");

  const refresh = useCallback(async () => {
    setStocksLoading(true);
    setTrialsLoading(true);
    setPipelineLoading(true);
    setNewsLoading(true);
    await Promise.allSettled([
      getStocks().then(setStocks).finally(() => setStocksLoading(false)),
      getTrials().then(setTrials).finally(() => setTrialsLoading(false)),
      getPipeline().then(setPipeline).finally(() => setPipelineLoading(false)),
      getNews().then(setNews).finally(() => setNewsLoading(false)),
    ]);
    setLastUpdated(new Date());
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
      <header className="border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-cyan-500 dark:text-cyan-400" />
          <span className="text-lg font-bold tracking-tight">Signal</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {(stocksLoading || trialsLoading || pipelineLoading || newsLoading) && (
            <RefreshCw size={14} className="animate-spin text-cyan-500 dark:text-cyan-400" />
          )}
          {lastUpdated && <span className="hidden sm:inline">Updated {fmtTime(lastUpdated)}</span>}
          <button
            onClick={refresh}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors text-xs dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main grid — stacks to a single column on mobile, 12-col grid from md up */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:h-[calc(100vh-56px)]">

        {/* Stocks — left */}
        <aside className="col-span-1 md:col-span-3 border-b md:border-b-0 md:border-r border-gray-200 p-4 h-[70vh] md:h-full overflow-y-auto dark:border-gray-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 dark:text-gray-500">Stocks</h2>
          {stocksLoading ? (
            <p className="text-gray-400 text-sm dark:text-gray-600">Loading...</p>
          ) : (
            <StockGrid stocks={stocks} />
          )}
        </aside>

        {/* Pipeline / Trials — middle */}
        <main className="col-span-1 md:col-span-5 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col h-[70vh] md:h-full dark:border-gray-800">
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
              <PipelineView pipeline={pipeline} loading={pipelineLoading} />
            ) : (
              <TrialFeed trials={trials} loading={trialsLoading} />
            )}
          </div>
        </main>

        {/* News — right */}
        <aside className="col-span-1 md:col-span-4 flex flex-col h-[70vh] md:h-full overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 mb-3 dark:text-gray-500">Industry News</h2>
          <div className="flex-1 px-4 pb-4 overflow-hidden">
            <NewsFeed news={news} loading={newsLoading} />
          </div>
        </aside>
      </div>

      <ThemeToggle />
    </div>
  );
}
