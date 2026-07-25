"""
Diffs issues between the two most recent crawl_runs so the daily
report can lead with "Critical Issues (new since yesterday)" instead
of repeating the same 40 findings every single day.
"""
from __future__ import annotations

from typing import Any, Dict, List, Tuple

from db.database import get_connection
from logger import get_logger

log = get_logger(__name__)


def _fingerprint(issue_row: Dict[str, Any]) -> Tuple[str, str, str]:
    """What makes two issues 'the same' across runs."""
    return (issue_row["url"], issue_row["category"], issue_row["detail"])


def get_previous_crawl_run_id(current_crawl_run_id: int) -> int | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id FROM crawl_runs WHERE id < ? ORDER BY id DESC LIMIT 1",
            (current_crawl_run_id,),
        ).fetchone()
        return row["id"] if row else None


def diff_issues(current_crawl_run_id: int) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns {"new": [...], "resolved": [...], "persisting": [...]}
    comparing current_crawl_run_id's issues against the prior run's.
    If there is no prior run, everything is "new".
    """
    previous_id = get_previous_crawl_run_id(current_crawl_run_id)

    with get_connection() as conn:
        current_rows = [
            dict(r) for r in conn.execute(
                "SELECT * FROM issues WHERE crawl_run_id = ?", (current_crawl_run_id,)
            ).fetchall()
        ]
        previous_rows = []
        if previous_id is not None:
            previous_rows = [
                dict(r) for r in conn.execute(
                    "SELECT * FROM issues WHERE crawl_run_id = ?", (previous_id,)
                ).fetchall()
            ]

    current_fp = {_fingerprint(r): r for r in current_rows}
    previous_fp = {_fingerprint(r): r for r in previous_rows}

    new = [r for fp, r in current_fp.items() if fp not in previous_fp]
    resolved = [r for fp, r in previous_fp.items() if fp not in current_fp]
    persisting = [r for fp, r in current_fp.items() if fp in previous_fp]

    log.info(
        "Diff vs crawl #%s: %d new, %d resolved, %d persisting",
        previous_id, len(new), len(resolved), len(persisting),
    )

    return {"new": new, "resolved": resolved, "persisting": persisting}
