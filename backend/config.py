TOP_PHARMA = [
    {"ticker": "JNJ",   "name": "Johnson & Johnson"},
    {"ticker": "PFE",   "name": "Pfizer"},
    {"ticker": "LLY",   "name": "Eli Lilly"},
    {"ticker": "MRK",   "name": "Merck"},
    {"ticker": "ABBV",  "name": "AbbVie"},
    {"ticker": "BMY",   "name": "Bristol-Myers Squibb"},
    {"ticker": "AZN",   "name": "AstraZeneca"},
    {"ticker": "GSK",   "name": "GSK"},
    {"ticker": "NVO",   "name": "Novo Nordisk"},
    {"ticker": "AMGN",  "name": "Amgen"},
    {"ticker": "GILD",  "name": "Gilead Sciences"},
    {"ticker": "REGN",  "name": "Regeneron"},
    {"ticker": "VRTX",  "name": "Vertex Pharmaceuticals"},
    {"ticker": "BIIB",  "name": "Biogen"},
    {"ticker": "RHHBY", "name": "Roche"},
]

BIOTECH = [
    {"ticker": "MRNA",  "name": "Moderna"},
    {"ticker": "BHVN",  "name": "Biohaven"},
    {"ticker": "WVE",   "name": "Wave Life Sciences"},
    {"ticker": "VKTX",  "name": "Viking Therapeutics"},
    {"ticker": "CRNX",  "name": "Crinetics Pharmaceuticals"},
    {"ticker": "ARCT",  "name": "Arctus Bio"},
    {"ticker": "BEAM",  "name": "Beam Therapeutics"},
    {"ticker": "EDIT",  "name": "Editas Medicine"},
    {"ticker": "NTLA",  "name": "Intellia Therapeutics"},
    {"ticker": "RCUS",  "name": "Arcus Biosciences"},
]

ALL_COMPANIES = TOP_PHARMA + BIOTECH

TICKER_TO_NAME = {c["ticker"]: c["name"] for c in ALL_COMPANIES}
NAME_TO_TICKER = {c["name"]: c["ticker"] for c in ALL_COMPANIES}

# Clinical trial sponsor search terms keyed by ticker
SPONSOR_TERMS = {
    "JNJ":   "Johnson",
    "PFE":   "Pfizer",
    "LLY":   "Lilly",
    "MRK":   "Merck",
    "ABBV":  "AbbVie",
    "BMY":   "Bristol-Myers",
    "AZN":   "AstraZeneca",
    "GSK":   "GlaxoSmithKline",
    "NVO":   "Novo Nordisk",
    "AMGN":  "Amgen",
    "GILD":  "Gilead",
    "REGN":  "Regeneron",
    "VRTX":  "Vertex",
    "BIIB":  "Biogen",
    "RHHBY": "Roche",
    "MRNA":  "Moderna",
    "BHVN":  "Biohaven",
    "WVE":   "Wave Life Sciences",
    "VKTX":  "Viking Therapeutics",
    "CRNX":  "Crinetics",
    "ARCT":  "Arctus",
    "BEAM":  "Beam Therapeutics",
    "EDIT":  "Editas",
    "NTLA":  "Intellia",
    "RCUS":  "Arcus Biosciences",
}

RSS_FEEDS = [
    {"name": "BioPharma Dive",  "url": "https://www.biopharmadive.com/feeds/news/"},
    {"name": "Endpoints News",  "url": "https://endpts.com/feed/"},
    {"name": "STAT News",       "url": "https://www.statnews.com/feed/"},
    {"name": "FiercePharma",    "url": "https://www.fiercepharma.com/rss/xml"},
]

# TTL in seconds for each data type
CACHE_TTL = {
    "stocks":   300,    # 5 min
    "news":     600,    # 10 min
    "trials":   1800,   # 30 min
    "pipeline": 3600,   # 60 min
}
