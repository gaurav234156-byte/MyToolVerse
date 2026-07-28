"""
keywords.py
Keyword research for MyToolVerse, built on top of the existing GSC
connection in analytics.py plus Google's free public autocomplete
endpoint (no API key required).

Two things this produces:
  1. Striking-distance keywords: queries you already rank for on
     page 2-3 (positions 11-30) with real impressions but few clicks --
     these are the fastest wins since you're already visible, just not
     high enough.
  2. Keyword suggestions: related searches pulled from Google
     autocomplete, seeded from your tool names, to spot content or
     tool-page gaps you haven't covered yet.

Requires:
    pip install requests --break-system-packages
    (google-api-python-client / google-auth already required by analytics.py)
"""

from __future__ import annotations

import datetime
import time
from typing import Any

import requests
from googleapiclient.discovery import build

from analytics import _get_credentials
from config import GSC_SITE_URL
from logger import get_logger

logger = get_logger(__name__)

AUTOCOMPLETE_URL = "https://suggestqueries.google.com/complete/search"


# ---------------------------------------------------------------------------
# Striking-distance keywords (from GSC)
# ---------------------------------------------------------------------------

def get_striking_distance_keywords(
    days: int = 28,
    position_min: float = 11.0,
    position_max: float = 30.0,
    min_impressions: int = 10,
    limit: int = 25,
) -> dict[str, Any]:
    """
    Finds queries ranking between `position_min` and `position_max`
    (page 2-3) with at least `min_impressions` impressions over the
    trailing `days` -- these are the closest to a page-1 breakthrough.

    Uses a wider window than the main GSC pull (28d vs 7d default)
    since striking-distance opportunities need more data to surface
    reliably.
    """
    try:
        creds = _get_credentials()
        service = build("searchconsole", "v1", credentials=creds)

        end_date = datetime.date.today() - datetime.timedelta(days=1)
        start_date = end_date - datetime.timedelta(days=days - 1)

        body = {
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "dimensions": ["query", "page"],
            "rowLimit": 500,
        }
        resp = (
            service.searchanalytics()
            .query(siteUrl=GSC_SITE_URL, body=body)
            .execute()
        )
        rows = resp.get("rows", [])

        opportunities = [
            {
                "query": row["keys"][0],
                "page": row["keys"][1],
                "clicks": row["clicks"],
                "impressions": row["impressions"],
                "ctr": round(row["ctr"] * 100, 2),
                "position": round(row["position"], 1),
            }
            for row in rows
            if position_min <= row["position"] <= position_max
            and row["impressions"] >= min_impressions
        ]

        # Highest impressions first -- most search volume to capture
        opportunities.sort(key=lambda r: r["impressions"], reverse=True)
        opportunities = opportunities[:limit]

        logger.info(
            f"Striking-distance scan OK: {len(opportunities)} keywords found "
            f"(position {position_min}-{position_max}, {days}d window)"
        )
        return {
            "date_range": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "position_range": [position_min, position_max],
            "opportunities": opportunities,
        }

    except Exception as e:
        logger.error(f"Striking-distance scan failed: {e}")
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# Keyword expansion (Google autocomplete, no API key)
# ---------------------------------------------------------------------------

def _autocomplete(query: str) -> list[str]:
    """Single call to Google's public autocomplete endpoint."""
    params = {"client": "firefox", "q": query}
    resp = requests.get(AUTOCOMPLETE_URL, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    return data[1] if len(data) > 1 else []


def get_keyword_suggestions(
    seed_terms: list[str], max_per_seed: int = 8
) -> dict[str, Any]:
    """
    Expands a list of seed terms (e.g. tool names) into related
    autocomplete suggestions. Rate-limited with a short delay between
    calls to stay well within Google's informal usage limits.
    """
    results: dict[str, list[str]] = {}
    try:
        for seed in seed_terms:
            suggestions = _autocomplete(seed)
            results[seed] = suggestions[:max_per_seed]
            time.sleep(0.3)

        total_suggestions = sum(len(v) for v in results.values())
        logger.info(
            f"Keyword expansion OK: {total_suggestions} suggestions "
            f"across {len(seed_terms)} seed terms"
        )
        return {"seed_count": len(seed_terms), "suggestions": results}

    except Exception as e:
        logger.error(f"Keyword expansion failed: {e}")
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# Combined entry point for main.py
# ---------------------------------------------------------------------------

def get_keyword_report(seed_terms: list[str] | None = None) -> dict[str, Any]:
    """Single call used by main.py to fold keyword research into the daily report."""
    report = {"striking_distance": get_striking_distance_keywords()}
    if seed_terms:
        report["suggestions"] = get_keyword_suggestions(seed_terms)
    return report


if __name__ == "__main__":
    import json
    # Example seed terms -- replace with a real sample of your tool names
    sample_seeds = ["pdf compressor", "json formatter", "password generator"]
    report = get_keyword_report(seed_terms=sample_seeds)
    print(json.dumps(report, indent=2))