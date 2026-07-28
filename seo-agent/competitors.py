"""
competitors.py
Lightweight, ethical competitor monitoring for MyToolVerse.

Rather than scraping competitor sites or paying for a backlink/rank-
tracking API, this reads only what competitors already publish for
crawlers: their public sitemap.xml. From that we can:

  1. Track their total published tool/page count over time (cache to
     JSON, diff week-over-week) to notice when they launch a wave of
     new tools.
  2. Do a catalog gap analysis: compare their URL slugs against your
     own tools-index to surface tool names they have that you don't
     (and vice versa) -- candidate ideas for new tools to build.

This respects robots.txt and only reads sitemaps, which are explicitly
published for crawling. No scraping of gated/private content, no
hitting rate limits, no third-party paid APIs.

Requires:
    pip install requests --break-system-packages
"""

from __future__ import annotations

import json
import re
import datetime
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

import requests

from config import BASE_DIR
from logger import get_logger

logger = get_logger(__name__)

CACHE_PATH = BASE_DIR / "cache" / "competitors.json"
REQUEST_TIMEOUT = 15
USER_AGENT = "MyToolVerseSEOAgent/1.0 (+https://mytoolverse.vercel.app)"

# Edit this list to add/remove competitors being tracked.
COMPETITORS: dict[str, str] = {
    "tinywow": "https://tinywow.com",
    "ilovepdf": "https://www.ilovepdf.com",
    "smallpdf": "https://smallpdf.com",
    "10015io": "https://10015.io",
}


# ---------------------------------------------------------------------------
# Sitemap discovery + parsing
# ---------------------------------------------------------------------------

def _find_sitemap_url(base_url: str) -> str | None:
    """Checks robots.txt for a declared sitemap; falls back to /sitemap.xml."""
    headers = {"User-Agent": USER_AGENT}
    try:
        resp = requests.get(f"{base_url}/robots.txt", headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.ok:
            match = re.search(r"(?im)^sitemap:\s*(\S+)", resp.text)
            if match:
                return match.group(1).strip()
    except requests.RequestException:
        pass

    fallback = f"{base_url}/sitemap.xml"
    try:
        resp = requests.head(fallback, headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.ok:
            return fallback
    except requests.RequestException:
        pass

    return None


def _parse_sitemap_urls(sitemap_url: str, _depth: int = 0) -> list[str]:
    """
    Parses a sitemap.xml (or sitemap index) and returns all page URLs.
    Recurses one level into sitemap indexes; stops there to avoid
    runaway requests on very large sites.
    """
    if _depth > 1:
        return []

    headers = {"User-Agent": USER_AGENT}
    try:
        resp = requests.get(sitemap_url, headers=headers, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
    except (requests.RequestException, ET.ParseError) as e:
        logger.warning(f"Could not parse sitemap {sitemap_url}: {e}")
        return []

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls: list[str] = []

    # Sitemap index -- recurse into each child sitemap
    sitemap_tags = root.findall("sm:sitemap/sm:loc", ns)
    if sitemap_tags:
        for tag in sitemap_tags[:20]:  # cap fan-out
            urls.extend(_parse_sitemap_urls(tag.text.strip(), _depth=_depth + 1))
        return urls

    # Regular urlset
    for loc in root.findall("sm:url/sm:loc", ns):
        if loc.text:
            urls.append(loc.text.strip())

    return urls


# ---------------------------------------------------------------------------
# Cache (for week-over-week diffing)
# ---------------------------------------------------------------------------

def _load_cache() -> dict[str, Any]:
    if CACHE_PATH.exists():
        try:
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def _save_cache(cache: dict[str, Any]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def _slug_from_url(url: str) -> str:
    """Best-effort slug/keyword extraction from a URL path for gap comparison."""
    path = re.sub(r"^https?://[^/]+", "", url).strip("/")
    path = path.split("?")[0]
    last_segment = path.split("/")[-1] if path else ""
    return last_segment.replace("-", " ").replace("_", " ").lower()


def get_competitor_report(our_tool_slugs: list[str] | None = None) -> dict[str, Any]:
    """
    Fetches each competitor's sitemap, tracks page-count changes since
    the last run, and (if our_tool_slugs is provided) flags competitor
    tool names that don't obviously match anything in our own catalog.
    """
    cache = _load_cache()
    today = datetime.date.today().isoformat()
    our_slugs_set = {s.replace("-", " ").lower() for s in (our_tool_slugs or [])}

    results: dict[str, Any] = {}

    for name, base_url in COMPETITORS.items():
        try:
            sitemap_url = _find_sitemap_url(base_url)
            if not sitemap_url:
                results[name] = {"error": "sitemap not found"}
                logger.warning(f"Competitor scan: no sitemap found for {name}")
                continue

            urls = _parse_sitemap_urls(sitemap_url)
            page_count = len(urls)

            prev = cache.get(name, {})
            prev_count = prev.get("page_count")
            delta = page_count - prev_count if prev_count is not None else None

            # Gap analysis: sample slugs not present in our own catalog
            gap_candidates = []
            if our_slugs_set:
                for url in urls[:500]:  # cap scan size
                    slug_words = _slug_from_url(url)
                    if slug_words and not any(
                        w in slug_words for w in our_slugs_set
                    ) and len(slug_words.split()) <= 5:
                        gap_candidates.append(slug_words)
                gap_candidates = list(dict.fromkeys(gap_candidates))[:15]  # dedupe, cap

            results[name] = {
                "page_count": page_count,
                "previous_page_count": prev_count,
                "delta_since_last_run": delta,
                "gap_candidates": gap_candidates,
            }

            cache[name] = {"page_count": page_count, "last_checked": today}

            logger.info(
                f"Competitor scan OK: {name} — {page_count} pages"
                + (f" ({delta:+d} since last run)" if delta is not None else " (first run)")
            )

        except Exception as e:
            results[name] = {"error": str(e)}
            logger.error(f"Competitor scan failed for {name}: {e}")

    _save_cache(cache)
    return results


if __name__ == "__main__":
    report = get_competitor_report()
    print(json.dumps(report, indent=2))