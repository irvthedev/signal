import logging
import time
import requests
from urllib.parse import urlencode, quote
from cache import store
from config import ALL_COMPANIES, SPONSOR_TERMS, CACHE_TTL

log = logging.getLogger(__name__)

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"
HEADERS  = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

PHASE_MAP = {"PHASE1": "1", "PHASE2": "2", "PHASE3": "3"}
FIELDS = "NCTId,BriefTitle,OverallStatus,Phase,PrimaryCompletionDate,LastUpdatePostDate,Condition,InterventionName,LeadSponsorName"


def _build_url(sponsor_term: str, agg_filter: str, page_size: int = 3) -> str:
    # aggFilters must not be percent-encoded — build the query string manually
    base_params = urlencode({
        "query.spons": sponsor_term,
        "pageSize": page_size,
        "sort": "LastUpdatePostDate:desc",
        "fields": FIELDS,
    })
    return f"{BASE_URL}?{base_params}&aggFilters={agg_filter}"


def _fetch_for_company(session: requests.Session, ticker: str, sponsor_term: str) -> list[dict]:
    results = []
    for phase_label, phase_code in PHASE_MAP.items():
        url = _build_url(sponsor_term, f"status:com,phase:{phase_code}")
        try:
            resp = session.get(url, timeout=15)
            resp.raise_for_status()
            studies = resp.json().get("studies", [])
            for s in studies:
                proto      = s.get("protocolSection", {})
                id_mod     = proto.get("identificationModule", {})
                status_mod = proto.get("statusModule", {})
                cond_mod   = proto.get("conditionsModule", {})
                interv_mod = proto.get("armsInterventionsModule", {})
                design_mod = proto.get("designModule", {})
                sponsor_mod = proto.get("sponsorCollaboratorsModule", {})

                interventions = [
                    i.get("name", "")
                    for i in interv_mod.get("interventions", [])
                    if i.get("type", "").upper() in ("DRUG", "BIOLOGICAL", "COMBINATION_PRODUCT")
                ]

                results.append({
                    "ticker": ticker,
                    "nct_id": id_mod.get("nctId"),
                    "title": id_mod.get("briefTitle", ""),
                    "phase": (design_mod.get("phases") or [phase_label])[0],
                    "status": status_mod.get("overallStatus"),
                    "primary_completion": status_mod.get("primaryCompletionDateStruct", {}).get("date"),
                    "last_updated": status_mod.get("lastUpdatePostDateStruct", {}).get("date"),
                    "conditions": cond_mod.get("conditions", []),
                    "interventions": interventions[:3],
                    "sponsor": sponsor_mod.get("leadSponsor", {}).get("name", sponsor_term),
                })
            time.sleep(0.35)
        except Exception as e:
            log.warning("Trials fetch failed for %s / %s: %s", ticker, phase_label, e)
    return results


def fetch() -> list[dict]:
    all_trials = []
    seen: set[tuple] = set()
    with requests.Session() as session:
        session.headers.update(HEADERS)
        for company in ALL_COMPANIES:
            ticker = company["ticker"]
            sponsor_term = SPONSOR_TERMS.get(ticker, company["name"])
            for trial in _fetch_for_company(session, ticker, sponsor_term):
                key = (trial["ticker"], trial.get("nct_id"))
                if key not in seen:
                    seen.add(key)
                    all_trials.append(trial)

    all_trials.sort(key=lambda x: x.get("last_updated") or "", reverse=True)
    store.set("trials", all_trials, CACHE_TTL["trials"])
    log.info("Fetched %d trial readouts", len(all_trials))
    return all_trials
