"""
Playwright-based BFS crawler: fetches pages, follows internal links,
stores results to SQLite.
"""
from __future__ import annotations

import asyncio
import json
import time
from collections import deque
from datetime import datetime, timezone
from typing import Any, Dict, List, Set
from urllib.parse import urlparse

from playwright.async_api import Browser, async_playwright

import config
from crawler.page_analyzer import analyze_page, extract_links
from crawler.sitemap import get_sitemap_urls
from db.database import get_connection, init_db
from logger import get_logger

log = get_logger(__name__)


async def _fetch_with_playwright(browser: Browser, url: str) -> Dict[str, Any]:
    page = await browser.new_page(user_agent=config.USER_AGENT)
    redirect_chain: List[str] = []
    status_code = None
    html = ""
    start = time.monotonic()
    try:
        response = await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        if response is not None:
            status_code = response.status
            req = response.request
            hops = []
            while req.redirected_from is not None:
                hops.append(req.redirected_from.url)
                req = req.redirected_from
            redirect_chain = list(reversed(hops)) + [url] if hops else []

        try:
            await page.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            log.debug("%s never reached networkidle -- using DOM as-is", url)

        html = await page.content()
    except Exception as exc:
        log.warning("Failed to load %s: %s", url, exc)
    finally:
        elapsed_ms = int((time.monotonic() - start) * 1000)
        await page.close()

    return {
        "status_code": status_code,
        "redirect_chain": redirect_chain,
        "html": html,
        "response_time_ms": elapsed_ms,
    }


def _normalize(u: str, base_url: str) -> str:
    return u.rstrip("/") if u != base_url else u


async def run_crawl(base_url: str | None = None, max_pages: int | None = None) -> int:
    base_url = (base_url or config.SITE_BASE_URL).rstrip("/")
    max_pages = max_pages or config.MAX_PAGES
    base_netloc = urlparse(base_url).netloc

    init_db()

    started_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO crawl_runs (started_at, base_url) VALUES (?, ?)",
            (started_at, base_url),
        )
        crawl_run_id = cur.lastrowid
        conn.commit()

    log.info("Starting crawl #%d for %s (max_pages=%d)", crawl_run_id, base_url, max_pages)

    sitemap_urls = {_normalize(u, base_url) for u in get_sitemap_urls(base_url)}
    log.info("Found %d URLs in sitemap.xml", len(sitemap_urls))

    visited: Set[str] = set()
    discovered_via_links: Set[str] = set()
    page_rows: List[Dict[str, Any]] = []

    # PHASE 1: true BFS starting only from the homepage, following only
    # actual in-page links. This is what gives an honest
    # "discovered_via_links" signal -- a page only counts as discovered
    # if it was reached by following real links from pages we've already
    # crawled, not just because it happens to be in the sitemap.
    link_queue: deque[str] = deque([base_url])

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            while link_queue and len(visited) < max_pages:
                url = _normalize(link_queue.popleft(), base_url)
                if url in visited:
                    continue
                visited.add(url)

                result = await _fetch_with_playwright(browser, url)
                await asyncio.sleep(config.CRAWL_DELAY_SECONDS)

                row: Dict[str, Any] = {
                    "url": url,
                    "status_code": result["status_code"],
                    "redirect_chain": result["redirect_chain"],
                    "response_time_ms": result["response_time_ms"],
                    "in_sitemap": url in sitemap_urls,
                    "discovered_via_links": url in discovered_via_links or url == base_url,
                }

                if result["html"]:
                    analysis = analyze_page(result["html"], url)
                    row.update(analysis)

                    links = extract_links(result["html"], url, base_netloc)
                    for link in links["internal"]:
                        link = _normalize(link, base_url)
                        if link not in visited:
                            discovered_via_links.add(link)
                            link_queue.append(link)
                else:
                    row.update({
                        "title": None, "meta_description": None, "h1_count": 0,
                        "h1_text": [], "canonical_url": None,
                        "canonical_issue": None, "og_present": False,
                        "og_issues": [], "twitter_present": False,
                        "twitter_issues": [], "images_total": 0,
                        "images_missing_alt": 0, "schema_types": [],
                        "schema_issues": [], "content_hash": None,
                    })

                page_rows.append(row)
                log.info("Crawled (%d/%d): %s [%s]",
                         len(visited), max_pages, url, row["status_code"])

            # PHASE 2: sweep up any sitemap URLs that link-following never
            # reached. These are visited too (so we still get their status
            # code, title, etc. in the report) but correctly marked as
            # NOT discovered via links -- true orphans.
            remaining = [u for u in sitemap_urls if u not in visited]
            for url in remaining:
                if len(visited) >= max_pages:
                    log.info("max_pages reached; %d sitemap-only URLs left unvisited",
                             len(remaining) - len(visited))
                    break
                visited.add(url)

                result = await _fetch_with_playwright(browser, url)
                await asyncio.sleep(config.CRAWL_DELAY_SECONDS)

                row = {
                    "url": url,
                    "status_code": result["status_code"],
                    "redirect_chain": result["redirect_chain"],
                    "response_time_ms": result["response_time_ms"],
                    "in_sitemap": True,
                    "discovered_via_links": url in discovered_via_links,
                }

                if result["html"]:
                    analysis = analyze_page(result["html"], url)
                    row.update(analysis)
                    # still extract links in case this orphan page links
                    # onward to other pages we haven't seen yet
                    links = extract_links(result["html"], url, base_netloc)
                    for link in links["internal"]:
                        link = _normalize(link, base_url)
                        if link not in visited and link not in [r["url"] for r in page_rows]:
                            discovered_via_links.add(link)
                else:
                    row.update({
                        "title": None, "meta_description": None, "h1_count": 0,
                        "h1_text": [], "canonical_url": None,
                        "canonical_issue": None, "og_present": False,
                        "og_issues": [], "twitter_present": False,
                        "twitter_issues": [], "images_total": 0,
                        "images_missing_alt": 0, "schema_types": [],
                        "schema_issues": [], "content_hash": None,
                    })

                page_rows.append(row)
                log.info("Crawled sitemap-only (%d/%d): %s [%s]",
                         len(visited), max_pages, url, row["status_code"])
        finally:
            await browser.close()

    _store_pages(crawl_run_id, page_rows)

    finished_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            "UPDATE crawl_runs SET finished_at = ?, pages_discovered = ?, pages_crawled = ? "
            "WHERE id = ?",
            (finished_at, len(sitemap_urls | discovered_via_links), len(page_rows), crawl_run_id),
        )
        conn.commit()

    log.info("Crawl #%d finished: %d pages crawled", crawl_run_id, len(page_rows))
    return crawl_run_id


def _store_pages(crawl_run_id: int, rows: List[Dict[str, Any]]) -> None:
    with get_connection() as conn:
        for r in rows:
            conn.execute(
                """
                INSERT INTO pages (
                    crawl_run_id, url, status_code, redirect_chain, title,
                    meta_description, h1_count, h1_text, canonical_url,
                    canonical_issue, og_present, og_issues, twitter_present,
                    twitter_issues, images_total, images_missing_alt,
                    schema_types, schema_issues, in_sitemap,
                    discovered_via_links, response_time_ms, content_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    crawl_run_id, r["url"], r["status_code"],
                    json.dumps(r["redirect_chain"]), r["title"],
                    r["meta_description"], r["h1_count"], json.dumps(r["h1_text"]),
                    r["canonical_url"], r["canonical_issue"], int(bool(r["og_present"])),
                    json.dumps(r["og_issues"]), int(bool(r["twitter_present"])),
                    json.dumps(r["twitter_issues"]), r["images_total"],
                    r["images_missing_alt"], json.dumps(r["schema_types"]),
                    json.dumps(r["schema_issues"]), int(bool(r["in_sitemap"])),
                    int(bool(r["discovered_via_links"])), r["response_time_ms"],
                    r["content_hash"],
                ),
            )
        conn.commit()


if __name__ == "__main__":
    asyncio.run(run_crawl())
