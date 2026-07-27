"""
analytics.py
Pulls Search Console (GSC) + GA4 data for MyToolVerse and returns it as
plain Python dicts/lists so main.py can fold it into the daily report.

Requires:
    pip install google-api-python-client google-auth google-analytics-data --break-system-packages

Env vars expected (see .env.example):
    GOOGLE_SERVICE_ACCOUNT_KEY_PATH  -> path to the service account JSON key
    GSC_SITE_URL                    -> e.g. https://mytoolverse.vercel.app/
    GA4_PROPERTY_ID                 -> numeric GA4 property id, e.g. 547073909
"""

import os
import datetime
from typing import Any

from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)

from config import (
    GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    GSC_SITE_URL,
    GA4_PROPERTY_ID,
)
from logger import get_logger

logger = get_logger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
]


def _get_credentials():
    """Load the shared service account credentials for both GSC and GA4."""
    if not os.path.exists(GOOGLE_SERVICE_ACCOUNT_KEY_PATH):
        raise FileNotFoundError(
            f"Service account key not found at {GOOGLE_SERVICE_ACCOUNT_KEY_PATH}"
        )
    return service_account.Credentials.from_service_account_file(
        GOOGLE_SERVICE_ACCOUNT_KEY_PATH, scopes=SCOPES
    )


# ---------------------------------------------------------------------------
# Search Console
# ---------------------------------------------------------------------------

def get_gsc_summary(days: int = 7) -> dict[str, Any]:
    """
    Pulls aggregate clicks/impressions/CTR/position for the last `days`,
    plus a per-query and per-page breakdown.
    """
    creds = _get_credentials()
    service = build("searchconsole", "v1", credentials=creds)

    end_date = datetime.date.today() - datetime.timedelta(days=1)  # GSC data lags ~1-2 days
    start_date = end_date - datetime.timedelta(days=days - 1)

    def _query(dimensions: list[str], row_limit: int = 20):
        body = {
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "dimensions": dimensions,
            "rowLimit": row_limit,
        }
        resp = (
            service.searchanalytics()
            .query(siteUrl=GSC_SITE_URL, body=body)
            .execute()
        )
        return resp.get("rows", [])

    try:
        totals_rows = _query([], row_limit=1)
        totals = totals_rows[0] if totals_rows else {}

        top_queries = _query(["query"], row_limit=15)
        top_pages = _query(["page"], row_limit=15)

        summary = {
            "date_range": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "totals": {
                "clicks": totals.get("clicks", 0),
                "impressions": totals.get("impressions", 0),
                "ctr": round(totals.get("ctr", 0) * 100, 2),
                "position": round(totals.get("position", 0), 1),
            },
            "top_queries": [
                {
                    "query": row["keys"][0],
                    "clicks": row["clicks"],
                    "impressions": row["impressions"],
                    "ctr": round(row["ctr"] * 100, 2),
                    "position": round(row["position"], 1),
                }
                for row in top_queries
            ],
            "top_pages": [
                {
                    "page": row["keys"][0],
                    "clicks": row["clicks"],
                    "impressions": row["impressions"],
                    "ctr": round(row["ctr"] * 100, 2),
                    "position": round(row["position"], 1),
                }
                for row in top_pages
            ],
        }
        logger.info(
            f"GSC pull OK: {summary['totals']['clicks']} clicks, "
            f"{summary['totals']['impressions']} impressions over {days}d"
        )
        return summary

    except Exception as e:
        logger.error(f"GSC pull failed: {e}")
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# GA4
# ---------------------------------------------------------------------------

def get_ga4_summary(days: int = 7) -> dict[str, Any]:
    """
    Pulls sessions/users/engagement for the last `days`, plus top pages
    and top traffic sources.
    """
    creds = _get_credentials()
    client = BetaAnalyticsDataClient(credentials=creds)
    property_path = f"properties/{GA4_PROPERTY_ID}"
    date_range = DateRange(start_date=f"{days}daysAgo", end_date="yesterday")

    try:
        # Overall totals
        totals_req = RunReportRequest(
            property=property_path,
            date_ranges=[date_range],
            metrics=[
                Metric(name="sessions"),
                Metric(name="activeUsers"),
                Metric(name="newUsers"),
                Metric(name="averageSessionDuration"),
                Metric(name="engagementRate"),
            ],
        )
        totals_resp = client.run_report(totals_req)
        totals_row = totals_resp.rows[0] if totals_resp.rows else None
        totals = {}
        if totals_row:
            values = [v.value for v in totals_row.metric_values]
            totals = {
                "sessions": int(float(values[0])),
                "active_users": int(float(values[1])),
                "new_users": int(float(values[2])),
                "avg_session_duration_sec": round(float(values[3]), 1),
                "engagement_rate": round(float(values[4]) * 100, 1),
            }

        # Top pages
        pages_req = RunReportRequest(
            property=property_path,
            date_ranges=[date_range],
            dimensions=[Dimension(name="pagePath")],
            metrics=[Metric(name="screenPageViews"), Metric(name="sessions")],
            limit=15,
        )
        pages_resp = client.run_report(pages_req)
        top_pages = [
            {
                "page": row.dimension_values[0].value,
                "views": int(float(row.metric_values[0].value)),
                "sessions": int(float(row.metric_values[1].value)),
            }
            for row in pages_resp.rows
        ]

        # Traffic sources
        sources_req = RunReportRequest(
            property=property_path,
            date_ranges=[date_range],
            dimensions=[Dimension(name="sessionDefaultChannelGroup")],
            metrics=[Metric(name="sessions")],
            limit=10,
        )
        sources_resp = client.run_report(sources_req)
        top_sources = [
            {
                "channel": row.dimension_values[0].value,
                "sessions": int(float(row.metric_values[0].value)),
            }
            for row in sources_resp.rows
        ]

        summary = {
            "date_range_days": days,
            "totals": totals,
            "top_pages": top_pages,
            "top_sources": top_sources,
        }
        logger.info(
            f"GA4 pull OK: {totals.get('sessions', 0)} sessions over {days}d"
        )
        return summary

    except Exception as e:
        logger.error(f"GA4 pull failed: {e}")
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# Combined entry point for main.py
# ---------------------------------------------------------------------------

def get_analytics_report(days: int = 7) -> dict[str, Any]:
    """Single call used by main.py to fold both sources into the daily report."""
    return {
        "search_console": get_gsc_summary(days=days),
        "ga4": get_ga4_summary(days=days),
    }


if __name__ == "__main__":
    import json
    report = get_analytics_report(days=7)
    print(json.dumps(report, indent=2))
