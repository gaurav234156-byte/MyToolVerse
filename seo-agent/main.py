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
from keywords import get_keyword_report
from competitors import get_competitor_report

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


def _seed_terms_from_pages(pages: list[dict], limit: int = 15) -> list[str]:
    """
    Builds keyword-expansion seed terms from the live tool catalog instead
    of a hardcoded list, so suggestions stay current as tools are added.
    Uses each tool page's H1 text (falls back to the URL slug) and dedupes.
    """
    seeds: list[str] = []
    seen: set[str] = set()

    for p in pages:
        url = p.get("url", "")
        if "/tools/" not in url:
            continue

        h1 = p.get("h1_text") or []
        term = h1[0].strip().lower() if h1 else url.rstrip("/").split("/")[-1].replace("-", " ")

        if term and term not in seen:
            seen.add(term)
            seeds.append(term)

        if len(seeds) >= limit:
            break

    return seeds


def _append_keyword_section(markdown_path, keyword_report: dict) -> None:
    """Appends a Keyword Opportunities section onto the existing markdown report."""
    striking = keyword_report.get("striking_distance", {})
    suggestions = keyword_report.get("suggestions", {})

    lines = ["\n\n## Keyword Opportunities\n"]

    if "error" in striking:
        lines.append(f"- **Striking distance**: failed to fetch ({striking['error']})\n")
    else:
        opps = striking.get("opportunities", [])
        pos_range = striking.get("position_range", [11, 30])
        lines.append(
            f"\n### Striking Distance (ranking positions {pos_range[0]:.0f}-{pos_range[1]:.0f})\n\n"
        )
        if opps:
            for o in opps[:10]:
                lines.append(
                    f"- **{o['query']}** — position {o['position']}, "
                    f"{o['impressions']} impressions, {o['clicks']} clicks "
                    f"(`{o['page']}`)\n"
                )
        else:
            lines.append("No striking-distance keywords found yet (needs more GSC history to accumulate).\n")

    if suggestions and "error" not in suggestions:
        lines.append("\n### Keyword Suggestions (autocomplete expansion)\n\n")
        for seed, terms in suggestions.get("suggestions", {}).items():
            if terms:
                lines.append(f"- **{seed}**: {', '.join(terms[:5])}\n")

    with open(markdown_path, "a", encoding="utf-8") as f:
        f.writelines(lines)


def _append_competitor_section(markdown_path, competitor_report: dict) -> None:
    """Appends a Competitor Watch section onto the existing markdown report."""
    lines = ["\n\n## Competitor Watch\n\n"]

    for name, data in competitor_report.items():
        if "error" in data:
            lines.append(f"- **{name}**: failed to fetch ({data['error']})\n")
            continue

        count = data.get("page_count", 0)
        delta = data.get("delta_since_last_run")
        delta_str = ""
        if delta is not None:
            sign = "+" if delta >= 0 else ""
            delta_str = f" ({sign}{delta} since last check)"
        elif delta is None and data.get("previous_page_count") is None:
            delta_str = " (first check — no baseline yet)"

        lines.append(f"- **{name}**: {count} pages{delta_str}\n")

        gaps = data.get("gap_candidates", [])
        if gaps:
            lines.append(f"  - Possible tool ideas not in our catalog: {', '.join(gaps[:8])}\n")

    with open(markdown_path, "a", encoding="utf-8") as f:
        f.writelines(lines)


def _our_tool_slugs_from_pages(pages: list[dict]) -> list[str]:
    """Extracts our own tool slugs from crawled pages, for gap-analysis comparison."""
    slugs = []
    for p in pages:
        url = p.get("url", "")
        if "/tools/" not in url:
            continue
        slug = url.rstrip("/").split("/")[-1]
        if slug:
            slugs.append(slug)
    return slugs


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

    # Pull keyword research (striking distance + autocomplete expansion)
    # and append to the markdown report (non-fatal if it fails)
    try:
        seed_terms = _seed_terms_from_pages(pages)
        keyword_report = get_keyword_report(seed_terms=seed_terms)
        _append_keyword_section(paths["markdown"], keyword_report)
        log.info("Keyword section appended to report")
    except Exception:
        log.exception("Keyword research pull failed; continuing without it")

    # Pull competitor sitemap tracking + gap analysis and append to the
    # markdown report (non-fatal if it fails)
    try:
        our_slugs = _our_tool_slugs_from_pages(pages)
        competitor_report = get_competitor_report(our_tool_slugs=our_slugs)
        _append_competitor_section(paths["markdown"], competitor_report)
        log.info("Competitor section appended to report")
    except Exception:
        log.exception("Competitor scan failed; continuing without it")

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