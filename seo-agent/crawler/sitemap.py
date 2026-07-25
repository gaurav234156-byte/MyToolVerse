"""
Sitemap fetching. Used two ways:
  1. As crawl seed URLs (faster than discovering everything via links).
  2. As a check on its own -- pages in the sitemap that 404, and pages
     that are reachable by links but missing from the sitemap.
"""
from __future__ import annotations

from typing import Set
from xml.etree import ElementTree

import requests

from logger import get_logger
from utils.retry import retry

log = get_logger(__name__)

_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


@retry(exceptions=(requests.RequestException,), tries=3)
def _fetch(url: str) -> str:
    resp = requests.get(url, timeout=15, headers={"User-Agent": "MyToolVerseSEOAgent/1.0"})
    resp.raise_for_status()
    return resp.text


def get_sitemap_urls(base_url: str) -> Set[str]:
    """
    Returns every <loc> URL found in sitemap.xml, following nested
    sitemap indexes one level deep. Returns an empty set (not an
    exception) if no sitemap exists yet -- that's itself a finding,
    not a crash.
    """
    sitemap_url = f"{base_url}/sitemap.xml"
    urls: Set[str] = set()

    try:
        xml_text = _fetch(sitemap_url)
    except requests.RequestException as exc:
        log.warning("Could not fetch %s: %s", sitemap_url, exc)
        return urls

    try:
        root = ElementTree.fromstring(xml_text)
    except ElementTree.ParseError as exc:
        log.warning("sitemap.xml is not valid XML: %s", exc)
        return urls

    # Sitemap index -> fetch each child sitemap
    sitemap_entries = root.findall("sm:sitemap/sm:loc", _NS)
    if sitemap_entries:
        for entry in sitemap_entries:
            child_url = (entry.text or "").strip()
            if not child_url:
                continue
            try:
                child_xml = _fetch(child_url)
                child_root = ElementTree.fromstring(child_xml)
                for loc in child_root.findall("sm:url/sm:loc", _NS):
                    if loc.text:
                        urls.add(loc.text.strip())
            except (requests.RequestException, ElementTree.ParseError) as exc:
                log.warning("Could not process child sitemap %s: %s", child_url, exc)
        return urls

    # Regular urlset
    for loc in root.findall("sm:url/sm:loc", _NS):
        if loc.text:
            urls.add(loc.text.strip())

    return urls


def validate_robots_txt(base_url: str) -> dict:
    """
    Basic robots.txt sanity checks: exists, points to a sitemap,
    doesn't accidentally disallow everything.
    """
    result = {"exists": False, "issues": [], "sitemap_declared": False}
    robots_url = f"{base_url}/robots.txt"
    try:
        text = _fetch(robots_url)
    except requests.RequestException as exc:
        result["issues"].append(f"robots.txt not reachable: {exc}")
        return result

    result["exists"] = True
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    if any(line.lower() == "sitemap:" or line.lower().startswith("sitemap:") for line in lines):
        result["sitemap_declared"] = True
    else:
        result["issues"].append("robots.txt does not declare a Sitemap: line")

    disallow_all = any(
        line.lower().replace(" ", "") == "disallow:/" for line in lines
    )
    if disallow_all:
        result["issues"].append(
            "robots.txt contains 'Disallow: /' -- this blocks the entire site from crawling"
        )

    return result
