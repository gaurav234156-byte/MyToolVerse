"""
Entry point for one full daily run. Called by:
    python main.py
either locally or from .github/workflows/seo-daily.yml.

Workflow (matches the architecture doc):
    crawl -> analyze -> detect issues -> store -> diff -> report -> notify
"""
from __future__ import annotations

import asyncio
import sys

from crawler.crawl import run_crawl
from crawler.issue_detector import detect_issues
from db.database import get_connection, init_db
from logger import get_logger
from reports.generate import generate_report
from utils.notify import notify_all

log = get_logger(__name__)


def _load_pages(crawl_run_id: int) -> list[dict]:
    import json as _json

    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM pages WHERE crawl_run_id = ?", (crawl_run_id,)
        ).fetchall()

    pages = []
    for r in rows:
        d = dict(r)
        for json_field in ("redirect_chain", "h1_text", "og_issues",
                            "twitter_issues", "schema_types", "schema_issues"):
            d[json_field] = _json.loads(d[json_field]) if d[json_field] else []
        pages.append(d)
    return pages


def _store_issues(crawl_run_id: int, issues: list[dict]) -> None:
    with get_connection() as conn:
        for i in issues:
            conn.execute(
                """
                INSERT INTO issues (
                    crawl_run_id, url, category, severity, detail,
                    impact, difficulty, confidence
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    crawl_run_id, i["url"], i["category"], i["severity"],
                    i["detail"], i["impact"], i["difficulty"], i["confidence"],
                ),
            )
        conn.commit()


def run_daily(base_url: str | None = None, max_pages: int | None = None) -> None:
    init_db()

    log.info("=== MyToolVerse SEO Agent: daily run starting ===")

    crawl_run_id = asyncio.run(run_crawl(base_url=base_url, max_pages=max_pages))

    pages = _load_pages(crawl_run_id)
    issues = detect_issues(pages)
    _store_issues(crawl_run_id, issues)
    log.info("Detected %d issues across %d pages", len(issues), len(pages))

    paths = generate_report(crawl_run_id)

    critical_count = sum(1 for i in issues if i["severity"] == "critical")
    summary = (
        f"MyToolVerse SEO Agent: crawl #{crawl_run_id} finished. "
        f"{len(pages)} pages, {len(issues)} issues ({critical_count} critical). "
        f"Report: {paths['markdown'].name}"
    )
    notify_all(summary)
    log.info(summary)
    log.info("=== Daily run complete ===")


if __name__ == "__main__":
    try:
        run_daily()
    except Exception:  # noqa: BLE001
        log.exception("Daily run failed")
        sys.exit(1)
