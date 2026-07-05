# Signal

Real-time pharmaceutical intelligence dashboard. Tracks clinical trial readouts, drug pipelines, stock prices, and industry news for top pharma and up-and-coming biotech companies.

## Data sources

| Panel | Source | Refresh |
|---|---|---|
| Pipeline / Trial Readouts | [ClinicalTrials.gov v2 API](https://clinicaltrials.gov/data-api/api) | 30–60 min |
| Stocks | yfinance (Yahoo Finance) | 5 min |
| Industry News | RSS — STAT News, Endpoints News, BioPharma Dive, FiercePharma | 10 min |

All sources are free with no API key required.

## Project structure

```
dosage/
├── backend/          # FastAPI + APScheduler
│   ├── main.py
│   ├── config.py     # company list, tickers, RSS URLs
│   ├── collectors/   # stocks, trials, pipeline, news
│   ├── cache/        # in-memory TTL cache
│   └── routers/      # /api/* endpoints
├── frontend/         # Next.js (TypeScript + Tailwind v4)
│   ├── app/
│   └── components/
└── requirements.txt
```

## Running locally

### Install dependencies

**Option A — one-shot script (recommended)**

```bash
./install.sh
```

Creates `.venv`, installs Python deps, and runs `npm install` in `frontend/`.

**Option B — manual**

Requires Python 3.11+ and Node.js 18+.

```bash
# Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install
```

### Backend

```bash
# Start the API server (runs on http://localhost:8000)
uvicorn main:app --reload --port 8000
```

On startup the server seeds all four data caches in a background thread, then runs collectors on their scheduled intervals automatically. You can verify everything is live at:

```
http://localhost:8000/api/health
http://localhost:8000/api/stocks
http://localhost:8000/api/trials
http://localhost:8000/api/pipeline
http://localhost:8000/api/news
```

### Frontend

Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard polls the backend every 2 minutes automatically.

### Running both at once

Open two terminal tabs from the repo root:

```bash
# Tab 1 — backend
source .venv/bin/activate && PYTHONPATH=backend uvicorn backend.main:app --port 8000

# Tab 2 — frontend
cd frontend && npm run dev
```

## Company universe

**Top pharma:** JNJ, PFE, LLY, MRK, ABBV, BMY, AZN, GSK, NVO, AMGN, GILD, REGN, VRTX, BIIB, RHHBY

**Biotech:** MRNA, BHVN, WVE, VKTX, CRNX, ARCT, BEAM, EDIT, NTLA, RCUS

To add or remove companies, edit `backend/config.py`.
