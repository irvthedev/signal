import logging
import sys
import os

# Make sure backend/ is on the path so sibling imports work
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from routers.api import router
import collectors.stocks as stocks_collector
import collectors.trials as trials_collector
import collectors.pipeline as pipeline_collector
import collectors.news as news_collector

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger(__name__)

app = FastAPI(title="Pharma Watch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(router)

scheduler = BackgroundScheduler()


@app.on_event("startup")
def startup():
    log.info("Running initial data fetch...")
    # Seed all collectors on startup (in background so server starts fast)
    import threading
    def seed():
        try: stocks_collector.fetch()
        except Exception as e: log.error("Stocks seed failed: %s", e)
        try: news_collector.fetch()
        except Exception as e: log.error("News seed failed: %s", e)
        try: trials_collector.fetch()
        except Exception as e: log.error("Trials seed failed: %s", e)
        try: pipeline_collector.fetch()
        except Exception as e: log.error("Pipeline seed failed: %s", e)
    threading.Thread(target=seed, daemon=True).start()

    scheduler.add_job(stocks_collector.fetch,   "interval", minutes=5,  id="stocks")
    scheduler.add_job(news_collector.fetch,     "interval", minutes=10, id="news")
    scheduler.add_job(trials_collector.fetch,   "interval", minutes=30, id="trials")
    scheduler.add_job(pipeline_collector.fetch, "interval", minutes=60, id="pipeline")
    scheduler.start()
    log.info("Scheduler started.")


@app.on_event("shutdown")
def shutdown():
    scheduler.shutdown()
