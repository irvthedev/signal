const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export type StockItem = {
  ticker: string;
  name: string;
  price: number | null;
  change_pct: number;
  prev_close: number | null;
  market_cap: number | null;
  category: "top_pharma" | "biotech";
  error?: string;
};

export type TrialItem = {
  ticker: string;
  nct_id: string;
  title: string;
  phase: string;
  status: string;
  primary_completion: string | null;
  last_updated: string | null;
  conditions: string[];
  interventions: string[];
  sponsor: string;
};

export type ActiveTrial = {
  ticker: string;
  source: string;
  nct_id: string;
  title: string;
  phase: string;
  status: string;
  start_date: string | null;
  conditions: string[];
  interventions: string[];
};

export type FDAApp = {
  ticker: string;
  source: string;
  application_number: string;
  brand_name: string;
  generic_name: string;
  applicant: string;
  submission_type: string | null;
  submission_status: string | null;
  submission_status_date: string | null;
};

export type PipelineEntry = {
  active_trials: ActiveTrial[];
  fda_applications: FDAApp[];
};

export type Pipeline = Record<string, PipelineEntry>;

export type NewsItem = {
  source: string;
  title: string;
  summary: string;
  url: string;
  published: string | null;
};

export const getStocks   = () => apiFetch<StockItem[]>("/api/stocks");
export const getTrials   = () => apiFetch<TrialItem[]>("/api/trials");
export const getPipeline = () => apiFetch<Pipeline>("/api/pipeline");
export const getNews     = () => apiFetch<NewsItem[]>("/api/news");
