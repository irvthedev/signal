"use client";
import { StockItem } from "@/lib/api";
import { Search, X } from "lucide-react";

export default function CompanyFilter({
  stocks,
  value,
  onChange,
  resolvedName,
}: {
  stocks: StockItem[];
  value: string;
  onChange: (v: string) => void;
  resolvedName: string | null;
}) {
  const options = [...stocks].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center">
        <Search size={12} className="absolute left-2.5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          list="company-options"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Filter by company..."
          className="bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 pl-7 pr-6 py-1.5 rounded-md transition-colors text-xs w-40 sm:w-48 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-800"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            aria-label="Clear filter"
            className="absolute right-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={13} />
          </button>
        )}
        <datalist id="company-options">
          {options.map(s => (
            <option key={s.ticker} value={s.name} />
          ))}
        </datalist>
      </div>
      {resolvedName && (
        <span className="hidden sm:inline bg-cyan-100 text-cyan-700 px-2 py-1 rounded-md text-xs font-semibold dark:bg-cyan-900 dark:text-cyan-300">
          {resolvedName}
        </span>
      )}
    </div>
  );
}
