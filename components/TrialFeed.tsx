"use client";
import { TrialItem } from "@/lib/api";
import { FlaskConical } from "lucide-react";

const PHASE_LABEL: Record<string, string> = {
  PHASE1: "Ph I",
  PHASE2: "Ph II",
  PHASE3: "Ph III",
  PHASE4: "Ph IV",
};

const PHASE_COLOR: Record<string, string> = {
  PHASE1: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  PHASE2: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  PHASE3: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  PHASE4: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

export default function TrialFeed({ trials }: { trials: TrialItem[] }) {
  if (!trials.length) {
    return <p className="text-gray-400 text-sm dark:text-gray-500">Loading trial readouts...</p>;
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
      {trials.slice(0, 40).map((t, i) => (
        <div key={t.nct_id ?? i} className="bg-white rounded-lg p-3 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="font-mono text-xs text-cyan-600 font-bold dark:text-cyan-400">{t.ticker}</span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${PHASE_COLOR[t.phase] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
              {PHASE_LABEL[t.phase] ?? t.phase}
            </span>
          </div>
          <p className="text-gray-900 text-sm leading-snug mb-2 dark:text-white">{t.title}</p>
          {t.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {t.conditions.slice(0, 2).map(c => (
                <span key={c} className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">{c}</span>
              ))}
            </div>
          )}
          {t.interventions.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <FlaskConical size={11} />
              {t.interventions.join(", ")}
            </div>
          )}
          {t.last_updated && (
            <p className="text-gray-400 text-xs mt-1 dark:text-gray-600">Updated {t.last_updated}</p>
          )}
        </div>
      ))}
    </div>
  );
}
