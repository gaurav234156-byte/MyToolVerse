"""
One crawl_run -> three report files (.md, .json, .html) in
seo-agent/reports/, dated. Markdown is the source of truth; JSON is
for future dashboard consumption; HTML is a quick static render of
the same Markdown for anyone who'd rather not read raw .md.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import config
from crawler.diff import diff_issues
from db.database import get_connection
from technical.directories import get_pending_directories
from logger import get_logger

log = get_logger(__name__)

SEVERITY_ORDER = {"critical": 0, "warning": 1, "info": 2}


def _load_crawl_run(crawl_run_id: int) -> Dict[str, Any]:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM crawl_runs WHERE id = ?", (crawl_run_id,)
        ).fetchone()
        return dict(row) if row else {}


def _load_issues(crawl_run_id: int) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM issues WHERE crawl_run_id = ?", (crawl_run_id,)
        ).fetchall()
        return [dict(r) for r in rows]


def _quick_wins(issues: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
    scored = [i for i in issues if i.get("impact") and i.get("difficulty")]
    scored.sort(key=lambda i: (i["impact"] / max(i["difficulty"], 1)), reverse=True)
    return scored[:limit]


def _group_by_category(issues: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    groups: Dict[str, List[Dict[str, Any]]] = {}
    for issue in issues:
        groups.setdefault(issue["category"], []).append(issue)
    return groups


def _render_issue_line(issue: Dict[str, Any]) -> str:
    return f"- **{issue['url']}** -- {issue['detail']}"


def _build_markdown(
    crawl_run: Dict[str, Any],
    issues: List[Dict[str, Any]],
    diff: Dict[str, List[Dict[str, Any]]],
    date_str: str,
) -> str:
    critical = [i for i in issues if i["severity"] == "critical"]
    warnings = [i for i in issues if i["severity"] == "warning"]
    info = [i for i in issues if i["severity"] == "info"]
    quick_wins = _quick_wins(issues)
    by_category = _group_by_category(issues)
    pending_dirs = get_pending_directories()

    lines: List[str] = []
    lines.append(f"# MyToolVerse SEO Report -- {date_str}")
    lines.append("")
    lines.append("## Executive Summary")
    lines.append(f"- Pages crawled: **{crawl_run.get('pages_crawled', 0)}**")
    lines.append(f"- Total open issues: **{len(issues)}** "
                 f"({len(critical)} critical, {len(warnings)} warning, {len(info)} info)")
    lines.append(f"- New since last run: **{len(diff['new'])}**")
    lines.append(f"- Resolved since last run: **{len(diff['resolved'])}** \U0001F389" if diff['resolved'] else
                 "- Resolved since last run: **0**")
    lines.append("")

    lines.append("## Critical Issues (new since yesterday)")
    new_critical = [i for i in diff["new"] if i["severity"] == "critical"]
    if new_critical:
        for i in new_critical:
            lines.append(_render_issue_line(i))
    else:
        lines.append("None. \U0001F389")
    lines.append("")

    lines.append("## Quick Wins (highest impact \u00f7 effort)")
    if quick_wins:
        for i in quick_wins:
            lines.append(
                f"- **[{i['category']}]** {i['url']} -- {i['detail']} "
                f"(impact {i['impact']}/5, difficulty {i['difficulty']}/5)"
            )
    else:
        lines.append("Nothing scored yet.")
    lines.append("")

    lines.append("## Technical SEO")
    technical_categories = [
        "unreachable", "broken_link", "server_error", "client_error",
        "redirect_chain", "canonical_issue", "missing_schema",
        "invalid_schema", "opengraph_issue", "twitter_card_issue",
        "orphan_page", "missing_from_sitemap",
    ]
    any_technical = False
    for cat in technical_categories:
        cat_issues = by_category.get(cat, [])
        if not cat_issues:
            continue
        any_technical = True
        lines.append(f"### {cat.replace('_', ' ').title()} ({len(cat_issues)})")
        for i in cat_issues[:15]:
            lines.append(_render_issue_line(i))
        if len(cat_issues) > 15:
            lines.append(f"- ...and {len(cat_issues) - 15} more")
    if not any_technical:
        lines.append("No technical issues found. \U0001F389")
    lines.append("")

    lines.append("## Content Opportunities")
    content_categories = [
        "missing_title", "title_too_long", "missing_meta_description",
        "meta_description_too_long", "missing_h1", "multiple_h1",
        "missing_alt_text", "duplicate_title", "duplicate_meta_description",
        "duplicate_content",
    ]
    any_content = False
    for cat in content_categories:
        cat_issues = by_category.get(cat, [])
        if not cat_issues:
            continue
        any_content = True
        lines.append(f"### {cat.replace('_', ' ').title()} ({len(cat_issues)})")
        for i in cat_issues[:15]:
            lines.append(_render_issue_line(i))
        if len(cat_issues) > 15:
            lines.append(f"- ...and {len(cat_issues) - 15} more")
    if not any_content:
        lines.append("No content issues found. \U0001F389")
    lines.append("")

    lines.append("## Backlink / Directory Opportunities")
    lines.append(f"{len(pending_dirs)} free directories not yet submitted to:")
    for d in pending_dirs:
        lines.append(f"- [ ] [{d['name']}]({d['url']}) ({d['category']})")
    lines.append("")
    lines.append(
        "*(Keyword research, competitor monitoring, AI-search-citation checks, "
        "and analytics [GSC/GA4] come online in Phase 2+ once those free "
        "accounts are connected -- see seo-agent/README.md.)*"
    )
    lines.append("")

    lines.append("## Next Steps")
    if new_critical:
        lines.append("1. Fix the new critical issues above first.")
    if quick_wins:
        lines.append(f"{'2' if new_critical else '1'}. Work through the Quick Wins list.")
    lines.append("- Submit to a couple of pending directories above.")
    lines.append("- Connect Google Search Console + GA4 (both free) to unlock Phase 2.")

    return "\n".join(lines)


def generate_report(crawl_run_id: int) -> Dict[str, Path]:
    config.REPORT_DIR.mkdir(parents=True, exist_ok=True)

    crawl_run = _load_crawl_run(crawl_run_id)
    issues = _load_issues(crawl_run_id)
    diff = diff_issues(crawl_run_id)
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    markdown = _build_markdown(crawl_run, issues, diff, date_str)

    md_path = config.REPORT_DIR / f"{date_str}.md"
    md_path.write_text(markdown, encoding="utf-8")

    json_path = config.REPORT_DIR / f"{date_str}.json"
    json_path.write_text(
        json.dumps({
            "crawl_run": crawl_run,
            "issues": issues,
            "diff_counts": {k: len(v) for k, v in diff.items()},
        }, indent=2, default=str),
        encoding="utf-8",
    )

    html_path = config.REPORT_DIR / f"{date_str}.html"
    html_path.write_text(_markdown_to_minimal_html(markdown, date_str), encoding="utf-8")

    log.info("Report written: %s / %s / %s", md_path, json_path, html_path)
    return {"markdown": md_path, "json": json_path, "html": html_path}


def _markdown_to_minimal_html(markdown: str, date_str: str) -> str:
    """
    Deliberately not pulling in a Markdown-to-HTML library for this --
    it's one report a day, and a <pre> render is perfectly readable.
    Swap in `markdown2` or similar later if you want real HTML styling.
    """
    escaped = (
        markdown.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )
    return (
        f"<!DOCTYPE html><html><head><meta charset='utf-8'>"
        f"<title>MyToolVerse SEO Report {date_str}</title></head>"
        f"<body><pre style='font-family:monospace;white-space:pre-wrap;"
        f"max-width:900px;margin:2rem auto;'>{escaped}</pre></body></html>"
    )
