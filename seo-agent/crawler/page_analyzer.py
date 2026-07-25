"""
Pure function: HTML string -> structured SEO signals. No network calls
here, which makes this the easiest module to unit test (see
tests/test_page_analyzer.py) -- feed it a fixture HTML string, assert
on the dict it returns.
"""
from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List, Set
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

from technical.schema_validator import (
    validate_opengraph,
    validate_schema_objects,
    validate_twitter,
)


def _same_domain(url: str, base_netloc: str) -> bool:
    return urlparse(url).netloc in ("", base_netloc)


def extract_links(html: str, page_url: str, base_netloc: str) -> Dict[str, Set[str]]:
    soup = BeautifulSoup(html, "lxml")
    internal, external = set(), set()
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        absolute = urljoin(page_url, href)
        absolute = absolute.split("#")[0]  # strip fragments for graph purposes
        if _same_domain(absolute, base_netloc):
            internal.add(absolute)
        else:
            external.add(absolute)
    return {"internal": internal, "external": external}


def analyze_page(html: str, page_url: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html, "lxml")

    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else None

    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_description = (
        meta_desc_tag.get("content", "").strip() if meta_desc_tag else None
    )

    h1_tags = soup.find_all("h1")
    h1_text = [h.get_text(strip=True) for h in h1_tags]

    canonical_tag = soup.find("link", attrs={"rel": "canonical"})
    canonical_url = canonical_tag.get("href", "").strip() if canonical_tag else None
    canonical_issue = None
    if canonical_tag is None:
        canonical_issue = "no canonical tag present"
    elif not canonical_url:
        canonical_issue = "canonical tag present but href is empty"

    images = soup.find_all("img")
    images_total = len(images)
    images_missing_alt = sum(
        1 for img in images if not img.get("alt", "").strip()
    )

    og_tags = {
        m.get("property"): m.get("content", "")
        for m in soup.find_all("meta", attrs={"property": True})
        if m.get("property", "").startswith("og:")
    }
    og_issues = validate_opengraph(og_tags)

    twitter_tags = {
        m.get("name"): m.get("content", "")
        for m in soup.find_all("meta", attrs={"name": True})
        if m.get("name", "").startswith("twitter:")
    }
    twitter_issues = validate_twitter(twitter_tags)

    schema_objects: List[Dict[str, Any]] = []
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(script.string or "{}")
        except (json.JSONDecodeError, TypeError):
            continue
        if isinstance(data, list):
            schema_objects.extend(d for d in data if isinstance(d, dict))
        elif isinstance(data, dict):
            if "@graph" in data and isinstance(data["@graph"], list):
                schema_objects.extend(
                    d for d in data["@graph"] if isinstance(d, dict)
                )
            else:
                schema_objects.append(data)
    schema_types = [
        obj.get("@type") if not isinstance(obj.get("@type"), list) else obj["@type"][0]
        for obj in schema_objects
    ]
    schema_issues = validate_schema_objects(schema_objects)

    # Hash on visible text (not raw HTML) so near-identical markup with
    # different whitespace doesn't false-positive as a duplicate, and so
    # two genuinely duplicate pages with different <script> nonces do.
    body = soup.find("body")
    visible_text = body.get_text(separator=" ", strip=True) if body else ""
    content_hash = hashlib.sha256(visible_text.encode("utf-8")).hexdigest()

    return {
        "title": title,
        "meta_description": meta_description,
        "h1_count": len(h1_tags),
        "h1_text": h1_text,
        "canonical_url": canonical_url,
        "canonical_issue": canonical_issue,
        "og_present": bool(og_tags),
        "og_issues": og_issues,
        "twitter_present": bool(twitter_tags),
        "twitter_issues": twitter_issues,
        "images_total": images_total,
        "images_missing_alt": images_missing_alt,
        "schema_types": schema_types,
        "schema_issues": schema_issues,
        "content_hash": content_hash,
    }
