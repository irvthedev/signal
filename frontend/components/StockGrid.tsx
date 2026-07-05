"use client";
import { StockItem } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function fmt(n: number | null) {
  if (n === null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function fmtCap(n: number | null) {
  if (!n) return null;
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n}`;
}

function StockCard({ s }: { s: StockItem }) {
  const up = s.change_pct > 0;
  const dn = s.change_pct < 0;
  return (
    <div className="bg-white rounded-lg p-3 flex flex-col gap-1 border border-gray-200 hover:border-gray-300 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-500">
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-gray-900 text-sm dark:text-white">{s.ticker}</span>
        {up ? <TrendingUp size={14} className="text-green-500 dark:text-green-400" />
         : dn ? <TrendingDown size={14} className="text-red-500 dark:text-red-400" />
         : <Minus size={14} className="text-gray-400 dark:text-gray-500" />}
      </div>
      <span className="text-gray-500 text-xs truncate dark:text-gray-400">{s.name}</span>
      <span className="text-gray-900 font-semibold dark:text-white">{fmt(s.price)}</span>
      <span className={`text-xs font-mono ${up ? "text-green-600 dark:text-green-400" : dn ? "text-red-600 dark:text-red-400" : "text-gray-500"}`}>
        {s.change_pct > 0 ? "+" : ""}{s.change_pct.toFixed(2)}%
      </span>
      {s.market_cap && <span className="text-gray-400 text-xs dark:text-gray-500">{fmtCap(s.market_cap)}</span>}
    </div>
  );
}

export default function StockGrid({ stocks }: { stocks: StockItem[] }) {
  const top     = stocks.filter(s => s.category === "top_pharma");
  const biotech = stocks.filter(s => s.category === "biotech");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Top Pharma</h3>
        <div className="grid grid-cols-2 gap-2">
          {top.map(s => <StockCard key={s.ticker} s={s} />)}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Biotech</h3>
        <div className="grid grid-cols-2 gap-2">
          {biotech.map(s => <StockCard key={s.ticker} s={s} />)}
        </div>
      </div>
    </div>
  );
}
