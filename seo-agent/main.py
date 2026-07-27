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
from analytics import get_analytics_report

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


def _append_analytics_section(markdown_path, analytics: dict) -> None:
    """Appends a GSC + GA4 summary section onto the existing markdown report."""
    gsc = analytics.get("search_console", {})
    ga4 = analytics.get("ga4", {})

    lines = ["\n\n## Analytics (last 7 days)\n"]

    if "error" in gsc:
        lines.append(f"- **Search Console**: failed to fetch ({gsc['error']})\n")
    else:
        t = gsc.get("totals", {})
        lines.append(
            f"- **Search Console**: {t.get('clicks', 0)} clicks, "
            f"{t.get('impressions', 0)} impressions, "
            f"{t.get('ctr', 0)}% CTR, avg position {t.get('position', 0)}\n"
        )
        top_pages = gsc.get("top_pages", [])
        if top_pages:
            lines.append("\n**Top pages (Search Console):**\n\n")
            for p in top_pages[:5]:
                lines.append(f"- `{p['page']}` — {p['clicks']} clicks, {p['impressions']} impressions\n")

    if "error" in ga4:
        lines.append(f"\n- **GA4**: failed to fetch ({ga4['error']})\n")
    else:
        t = ga4.get("totals", {})
        lines.append(
            f"\n- **GA4**: {t.get('sessions', 0)} sessions, "
            f"{t.get('active_users', 0)} active users, "
            f"{t.get('engagement_rate', 0)}% engagement rate\n"
        )
        top_sources = ga4.get("top_sources", [])
        if top_sources:
            lines.append("\n**Top traffic sources:**\n\n")
            for s in top_sources[:5]:
                lines.append(f"- {s['channel']} — {s['sessions']} sessions\n")

    with open(markdown_path, "a", encoding="utf-8") as f:
        f.writelines(lines)


def run_daily(base_url: str | None = None, max_pages: int | None = None) -> None:
    init_db()

    log.info("=== MyToolVerse SEO Agent: daily run starting ===")

    crawl_run_id = asyncio.run(run_crawl(base_url=base_url, max_pages=max_pages))

    pages = _load_pages(crawl_run_id)
    issues = detect_issues(pages)
    _store_issues(crawl_run_id, issues)
    log.info("Detected %d issues across %d pages", len(issues), len(pages))

    paths = generate_report(crawl_run_id)

    # Pull GSC + GA4 data and append to the markdown report (non-fatal if it fails)
    try:
        analytics = get_analytics_report(days=7)
        _append_analytics_section(paths["markdown"], analytics)
        log.info("Analytics section appended to report")
    except Exception:
        log.exception("Analytics pull failed; continuing without it")

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
