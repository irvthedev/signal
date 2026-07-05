import logging
import time
import requests
from urllib.parse import urlencode
from cache import store
from config import ALL_COMPANIES, SPONSOR_TERMS, CACHE_TTL

log = logging.getLogger(__name__)

CT_URL  = "https://clinicaltrials.gov/api/v2/studies"
FDA_URL = "https://api.fda.gov/drug/drugsfda.json"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

PHASE_MAP = {"PHASE1": "1", "PHASE2": "2", "PHASE3": "3"}
CT_FIELDS = "NCTId,BriefTitle,OverallStatus,Phase,StartDate,Condition,InterventionName,LeadSponsorName"


def _ct_url(sponsor_term: str, agg_filter: str, page_size: int = 5) -> str:
    base = urlencode({"query.spons": sponsor_term, "pageSize": page_size,
                      "sort": "LastUpdatePostDate:desc", "fields": CT_FIELDS})
    return f"{CT_URL}?{base}&aggFilters={agg_filter}"


def _ct_pipeline(session: requests.Session, ticker: str, sponsor_term: str) -> list[dict]:
    items = []
    for phase_label, phase_code in PHASE_MAP.items():
        url = _ct_url(sponsor_term, f"status:rec,phase:{phase_code}")
        try:
            resp = session.get(url, timeout=15)
            resp.raise_for_status()
            for s in resp.json().get("studies", []):
                proto      = s.get("protocolSection", {})
                id_mod     = proto.get("identificationModule", {})
                status_mod = proto.get("statusModule", {})
                cond_mod   = proto.get("conditionsModule", {})
                interv_mod = proto.get("armsInterventionsModule", {})
                design_mod = proto.get("designModule", {})

                interventions = [
                    i.get("name", "")
                    for i in interv_mod.get("interventions", [])
                    if i.get("type", "").upper() in ("DRUG", "BIOLOGICAL", "COMBINATION_PRODUCT")
                ]

                items.append({
                    "ticker": ticker,
                    "source": "clinicaltrials",
                    "nct_id": id_mod.get("nctId"),
                    "title": id_mod.get("briefTitle", ""),
                    "phase": (design_mod.get("phases") or [phase_label])[0],
                    "status": status_mod.get("overallStatus"),
                    "start_date": status_mod.get("startDateStruct", {}).get("date"),
                    "conditions": cond_mod.get("conditions", [])[:3],
                    "interventions": interventions[:3],
                })
            time.sleep(0.35)
        except Exception as e:
            log.warning("CT pipeline fetch failed for %s / %s: %s", ticker, phase_label, e)
    return items


def _fda_pipeline(session: requests.Session, ticker: str, sponsor_term: str) -> list[dict]:
    items = []
    try:
        resp = session.get(FDA_URL, params={
            "search": f'applicant:"{sponsor_term}"',
            "limit": 10,
        }, timeout=15)
        if resp.status_code == 404:
            return []
        resp.raise_for_status()
        for result in resp.json().get("results", []):
            submissions = result.get("submissions", [])
            latest = max(submissions, key=lambda s: s.get("submission_status_date", ""), default={})
            items.append({
                "ticker": ticker,
                "source": "fda",
                "application_number": result.get("application_number"),
                "brand_name": result.get("brand_name", ""),
                "generic_name": result.get("generic_name", ""),
                "applicant": result.get("applicant", ""),
                "submission_type": latest.get("submission_type"),
                "submission_status": latest.get("submission_status"),
                "submission_status_date": latest.get("submission_status_date"),
            })
    except Exception as e:
        log.warning("FDA pipeline fetch failed for %s: %s", ticker, e)
    return items


def fetch() -> dict:
    pipeline: dict[str, dict] = {}
    with requests.Session() as session:
        session.headers.update(HEADERS)
        for company in ALL_COMPANIES:
            ticker = company["ticker"]
            sponsor_term = SPONSOR_TERMS.get(ticker, company["name"])
            ct_items  = _ct_pipeline(session, ticker, sponsor_term)
            fda_items = _fda_pipeline(session, ticker, sponsor_term)
            # Deduplicate active trials by nct_id (same trial can match multiple phase queries)
            seen: set[str | None] = set()
            unique_ct: list[dict] = []
            for t in ct_items:
                nct = t.get("nct_id")
                if nct not in seen:
                    seen.add(nct)
                    unique_ct.append(t)
            if unique_ct or fda_items:
                pipeline[ticker] = {"active_trials": unique_ct, "fda_applications": fda_items}

    store.set("pipeline", pipeline, CACHE_TTL["pipeline"])
    log.info("Fetched pipeline for %d companies", len(pipeline))
    return pipeline
