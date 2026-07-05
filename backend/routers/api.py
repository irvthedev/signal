from fastapi import APIRouter
from cache import store
import collectors.stocks as stocks_collector
import collectors.trials as trials_collector
import collectors.pipeline as pipeline_collector
import collectors.news as news_collector

router = APIRouter(prefix="/api")


def _get_or_fetch(key: str, collector_fn):
    cached = store.get(key)
    if cached is not None:
        return cached
    return collector_fn()


@router.get("/stocks")
def get_stocks():
    return _get_or_fetch("stocks", stocks_collector.fetch)


@router.get("/trials")
def get_trials():
    return _get_or_fetch("trials", trials_collector.fetch)


@router.get("/pipeline")
def get_pipeline():
    return _get_or_fetch("pipeline", pipeline_collector.fetch)


@router.get("/news")
def get_news():
    return _get_or_fetch("news", news_collector.fetch)


@router.get("/health")
def health():
    from cache.store import _store
    import time
    keys = {k: "fresh" if v[1] > time.time() else "expired" for k, v in _store.items()}
    return {"status": "ok", "cache": keys}
