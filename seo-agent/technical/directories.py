"""
"AI Tool Directory Finder" -- honestly, discovering these automatically
via scraping is unreliable and against most of these sites' ToS. What
actually works is a maintained checklist you submit to manually (each
one takes 5-15 minutes) with status tracked here so the daily report
can remind you which ones are still pending.

Add to DIRECTORIES over time as you find more -- this list is a
starting point, not exhaustive.
"""
from __future__ import annotations

import json
from typing import Any, Dict, List

import config

DIRECTORIES: List[Dict[str, str]] = [
    {"name": "Product Hunt", "url": "https://www.producthunt.com/posts/new", "category": "general"},
    {"name": "AlternativeTo", "url": "https://alternativeto.net/software/new/", "category": "general"},
    {"name": "Futurepedia", "url": "https://www.futurepedia.io/submit-tool", "category": "ai"},
    {"name": "Toolify", "url": "https://www.toolify.ai/submit", "category": "ai"},
    {"name": "There's An AI For That", "url": "https://theresanaiforthat.com/submit/", "category": "ai"},
    {"name": "AI Scout", "url": "https://aiscout.net/submit", "category": "ai"},
    {"name": "SaaSHub", "url": "https://www.saashub.com/", "category": "general"},
    {"name": "BetaList", "url": "https://betalist.com/submit", "category": "startup"},
    {"name": "Indie Hackers", "url": "https://www.indiehackers.com/products/new", "category": "startup"},
    {"name": "Hacker News (Show HN)", "url": "https://news.ycombinator.com/showhn.html", "category": "startup"},
    {"name": "Slant", "url": "https://www.slant.co/", "category": "general"},
    {"name": "G2", "url": "https://www.g2.com/products/new", "category": "general"},
]

_STATUS_FILE = config.BASE_DIR / "cache" / "directory_status.json"


def load_status() -> Dict[str, Dict[str, Any]]:
    if not _STATUS_FILE.exists():
        return {}
    return json.loads(_STATUS_FILE.read_text(encoding="utf-8"))


def save_status(status: Dict[str, Dict[str, Any]]) -> None:
    _STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    _STATUS_FILE.write_text(json.dumps(status, indent=2), encoding="utf-8")


def mark_submitted(name: str, approved: bool | None = None) -> None:
    """Call this manually (or from a small CLI) after you submit somewhere."""
    status = load_status()
    status[name] = {"submitted": True, "approved": approved}
    save_status(status)


def get_pending_directories() -> List[Dict[str, str]]:
    status = load_status()
    return [d for d in DIRECTORIES if not status.get(d["name"], {}).get("submitted")]
