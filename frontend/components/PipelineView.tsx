"use client";
import { Pipeline } from "@/lib/api";

const PHASE_DOT: Record<string, string> = {
  PHASE1: "bg-blue-500",
  PHASE2: "bg-purple-500",
  PHASE3: "bg-amber-500",
};

const PHASE_SHORT: Record<string, string> = {
  PHASE1: "I",
  PHASE2: "II",
  PHASE3: "III",
};

export default function PipelineView({ pipeline }: { pipeline: Pipeline }) {
  const tickers = Object.keys(pipeline);
  if (!tickers.length) {
    return <p className="text-gray-400 text-sm dark:text-gray-500">Loading pipeline data...</p>;
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-1">
      {tickers.map(ticker => {
        const entry = pipeline[ticker];
        const trials = entry.active_trials ?? [];
        const fda = entry.fda_applications ?? [];
        if (!trials.length && !fda.length) return null;

        const byPhase: Record<string, number> = {};
        trials.forEach(t => { byPhase[t.phase] = (byPhase[t.phase] ?? 0) + 1; });

        return (
          <div key={ticker} className="bg-white rounded-lg p-3 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-gray-900 text-sm dark:text-white">{ticker}</span>
              <div className="flex gap-1">
                {Object.entries(byPhase).map(([phase, count]) => (
                  <span key={phase} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded dark:text-gray-300 dark:bg-gray-700">
                    <span className={`w-2 h-2 rounded-full ${PHASE_DOT[phase] ?? "bg-gray-400"}`} />
                    Ph{PHASE_SHORT[phase] ?? phase}: {count}
                  </span>
                ))}
              </div>
            </div>

            {trials.slice(0, 3).map((t, i) => (
              <div key={t.nct_id ?? i} className="border-t border-gray-100 pt-1.5 mt-1.5 first:border-0 first:pt-0 first:mt-0 dark:border-gray-700">
                <p className="text-gray-700 text-xs leading-snug dark:text-gray-300">{t.title}</p>
                {t.conditions.length > 0 && (
                  <p className="text-gray-400 text-xs mt-0.5 dark:text-gray-500">{t.conditions[0]}</p>
                )}
              </div>
            ))}

            {fda.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-amber-600 font-semibold mb-1 dark:text-amber-400">FDA Applications</p>
                {fda.slice(0, 2).map((f, i) => (
                  <div key={f.application_number ?? i} className="text-xs text-gray-500 mb-0.5 dark:text-gray-400">
                    <span className="text-gray-800 dark:text-gray-200">{f.brand_name || f.generic_name}</span>
                    {f.submission_status && <span className="text-gray-400 ml-1 dark:text-gray-500">· {f.submission_status}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
