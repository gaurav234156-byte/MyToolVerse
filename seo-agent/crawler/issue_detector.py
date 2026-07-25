"""
Turns the raw `pages` rows for a crawl_run into `issues` rows.
Kept separate from crawl.py so it can run against historical data too
(e.g. re-score issues if we tune the impact/difficulty heuristics later
without re-crawling).

Impact/Difficulty/Confidence are 1-5 heuristics, not science -- they
exist so the report can sort "Quick Wins" sensibly. Tune the constants
below as you see what actually moves the needle.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List

from logger import get_logger

log = get_logger(__name__)


def _issue(url: str, category: str, severity: str, detail: str,
           impact: int, difficulty: int, confidence: int) -> Dict[str, Any]:
    return {
        "url": url,
        "category": category,
        "severity": severity,
        "detail": detail,
        "impact": impact,
        "difficulty": difficulty,
        "confidence": confidence,
    }


def detect_issues(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    `pages` is a list of dicts matching the `pages` table columns
    (as produced by crawl.py for one crawl_run). Returns a list of
    issue dicts ready to insert.
    """
    issues: List[Dict[str, Any]] = []

    by_title: Dict[str, List[str]] = defaultdict(list)
    by_meta: Dict[str, List[str]] = defaultdict(list)
    by_hash: Dict[str, List[str]] = defaultdict(list)

    for p in pages:
        url = p["url"]

        # --- broken links / bad status codes ---
        status = p.get("status_code")
        if status is None:
            issues.append(_issue(
                url, "unreachable", "critical",
                "Page could not be fetched at all (timeout or DNS/network error)",
                impact=5, difficulty=3, confidence=4,
            ))
        elif status == 404:
            issues.append(_issue(
                url, "broken_link", "critical",
                "Page returns 404",
                impact=4, difficulty=2, confidence=5,
            ))
        elif status >= 500:
            issues.append(_issue(
                url, "server_error", "critical",
                f"Page returns {status}",
                impact=5, difficulty=3, confidence=5,
            ))
        elif status >= 400:
            issues.append(_issue(
                url, "client_error", "warning",
                f"Page returns {status}",
                impact=3, difficulty=2, confidence=5,
            ))

        # --- redirect chains ---
        chain = p.get("redirect_chain")
        if chain and len(chain) > 1:
            issues.append(_issue(
                url, "redirect_chain", "warning",
                f"Redirect chain of {len(chain)} hops -- update internal links to point straight to the final URL",
                impact=2, difficulty=2, confidence=5,
            ))

        # --- title / meta description ---
        if not p.get("title"):
            issues.append(_issue(
                url, "missing_title", "critical",
                "No <title> tag",
                impact=5, difficulty=1, confidence=5,
            ))
        elif len(p["title"]) > 60:
            issues.append(_issue(
                url, "title_too_long", "info",
                f"Title is {len(p['title'])} chars (Google typically truncates ~60)",
                impact=1, difficulty=1, confidence=3,
            ))

        if not p.get("meta_description"):
            issues.append(_issue(
                url, "missing_meta_description", "warning",
                "No meta description -- Google will auto-generate a snippet instead",
                impact=3, difficulty=1, confidence=5,
            ))
        elif len(p.get("meta_description") or "") > 160:
            issues.append(_issue(
                url, "meta_description_too_long", "info",
                f"Meta description is {len(p['meta_description'])} chars (typically truncated ~160)",
                impact=1, difficulty=1, confidence=3,
            ))

        # --- headings ---
        h1_count = p.get("h1_count") or 0
        if h1_count == 0:
            issues.append(_issue(
                url, "missing_h1", "warning",
                "No H1 on page",
                impact=3, difficulty=1, confidence=5,
            ))
        elif h1_count > 1:
            issues.append(_issue(
                url, "multiple_h1", "info",
                f"{h1_count} H1 tags on page -- should be exactly one",
                impact=2, difficulty=2, confidence=4,
            ))

        # --- images ---
        missing_alt = p.get("images_missing_alt") or 0
        if missing_alt > 0:
            issues.append(_issue(
                url, "missing_alt_text", "warning",
                f"{missing_alt} of {p.get('images_total', 0)} images missing alt text",
                impact=2, difficulty=1, confidence=5,
            ))

        # --- canonical ---
        if p.get("canonical_issue"):
            issues.append(_issue(
                url, "canonical_issue", "warning",
                p["canonical_issue"],
                impact=3, difficulty=1, confidence=5,
            ))

        # --- OpenGraph / Twitter ---
        for tag_issue in (p.get("og_issues") or []):
            issues.append(_issue(
                url, "opengraph_issue", "info",
                tag_issue, impact=1, difficulty=1, confidence=5,
            ))
        for tag_issue in (p.get("twitter_issues") or []):
            issues.append(_issue(
                url, "twitter_card_issue", "info",
                tag_issue, impact=1, difficulty=1, confidence=5,
            ))

        # --- schema ---
        if not p.get("schema_types"):
            issues.append(_issue(
                url, "missing_schema", "warning",
                "No Schema.org JSON-LD found on page",
                impact=3, difficulty=2, confidence=5,
            ))
        for schema_issue in (p.get("schema_issues") or []):
            issues.append(_issue(
                url, "invalid_schema", "warning",
                schema_issue, impact=2, difficulty=2, confidence=5,
            ))

        # --- orphan pages ---
        in_sitemap = p.get("in_sitemap")
        discovered_via_links = p.get("discovered_via_links")
        if in_sitemap and not discovered_via_links:
            issues.append(_issue(
                url, "orphan_page", "warning",
                "Page is in sitemap.xml but not linked from anywhere else on the site",
                impact=3, difficulty=2, confidence=4,
            ))
        if discovered_via_links and not in_sitemap:
            issues.append(_issue(
                url, "missing_from_sitemap", "info",
                "Page is linked internally but missing from sitemap.xml",
                impact=2, difficulty=1, confidence=4,
            ))

        # collect for duplicate detection below
        if p.get("title"):
            by_title[p["title"]].append(url)
        if p.get("meta_description"):
            by_meta[p["meta_description"]].append(url)
        if p.get("content_hash"):
            by_hash[p["content_hash"]].append(url)

    # --- duplicates (cross-page) ---
    for title, urls in by_title.items():
        if len(urls) > 1:
            for url in urls:
                issues.append(_issue(
                    url, "duplicate_title", "warning",
                    f"Title \"{title[:60]}\" is shared by {len(urls)} pages: {', '.join(urls)}",
                    impact=3, difficulty=2, confidence=5,
                ))

    for meta, urls in by_meta.items():
        if len(urls) > 1:
            for url in urls:
                issues.append(_issue(
                    url, "duplicate_meta_description", "info",
                    f"Meta description shared by {len(urls)} pages: {', '.join(urls)}",
                    impact=2, difficulty=2, confidence=5,
                ))

    for content_hash, urls in by_hash.items():
        if len(urls) > 1:
            for url in urls:
                issues.append(_issue(
                    url, "duplicate_content", "critical",
                    f"Visible content is near-identical across {len(urls)} pages: {', '.join(urls)}",
                    impact=4, difficulty=3, confidence=4,
                ))

    return issues
