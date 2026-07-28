"""
backlinks.py
Assisted directory-submission tracking for MyToolVerse.

Important: this deliberately does NOT auto-submit to directories.
Sites like Product Hunt and Hacker News explicitly prohibit automated/
bot submissions and will flag or ban accounts that do this -- and many
directories require a real account, manual review, or CAPTCHA anyway.

What this DOES do:
  1. Keeps a single source of truth for your submission copy (name,
     tagline, short/long description, tags) so every directory gets
     consistent, ready-to-paste text instead of you rewriting it each
     time.
  2. Tracks submission status per directory in a local JSON file.
  3. Surfaces a short "X of 12 submitted" checklist in the daily report
     so it doesn't get forgotten.
  4. When run standalone, prints the full submission copy for every
     still-pending directory, so you can work through the list by hand.

Usage:
    python backlinks.py                 -> prints copy for all pending directories
    python backlinks.py mark producthunt -> marks a directory as submitted
    python backlinks.py status          -> shows current status for all directories
"""

from __future__ import annotations

import json
import sys
import datetime
from typing import Any

from config import BASE_DIR
from logger import get_logger

logger = get_logger(__name__)

CACHE_PATH = BASE_DIR / "cache" / "backlinks.json"

# ---------------------------------------------------------------------------
# Submission copy -- single source of truth, reused across every directory
# ---------------------------------------------------------------------------

SITE = {
    "name": "MyToolVerse",
    "url": "https://mytoolverse.vercel.app",
    "tagline": "100+ free online tools for PDF, image, AI & more",
    "short_description": (
        "MyToolVerse is a free all-in-one toolbox: compress PDFs, edit "
        "images, generate AI content, format code, calculate, and more "
        "— no installs, no signup."
    ),
    "long_description": (
        "MyToolVerse brings together 100+ free online tools across ten "
        "categories — PDF, image, AI, text, developer, calculator, video, "
        "audio, student, and business tools — in one consistent, fast "
        "interface. Most tools run client-side in the browser, so files "
        "never leave your device. No account required, no paywalls on "
        "core functionality."
    ),
    "tags": [
        "productivity", "free tools", "pdf tools", "image tools",
        "ai tools", "developer tools", "online utilities",
    ],
    "contact_email": "support@mytoolverse.com",
}

# ---------------------------------------------------------------------------
# Directories -- add/remove entries here as needed
# ---------------------------------------------------------------------------

DIRECTORIES: dict[str, dict[str, str]] = {
    "producthunt": {
        "display_name": "Product Hunt",
        "submit_url": "https://www.producthunt.com/posts/new",
        "category": "general",
        "notes": "Requires a real account and a launch date; bot/automated posts are against ToS.",
    },
    "alternativeto": {
        "display_name": "AlternativeTo",
        "submit_url": "https://alternativeto.net/software/new/",
        "category": "general",
        "notes": "Ask: list MyToolVerse as an alternative to specific paid tools (e.g. Smallpdf, TinyPNG).",
    },
    "futurepedia": {
        "display_name": "Futurepedia",
        "submit_url": "https://www.futurepedia.io/submit-tool",
        "category": "ai",
        "notes": "AI-tools-focused directory; emphasize the AI tools category in the pitch.",
    },
    "toolify": {
        "display_name": "Toolify",
        "submit_url": "https://www.toolify.ai/submit",
        "category": "ai",
        "notes": "AI-tools-focused directory.",
    },
    "theresanaiforthat": {
        "display_name": "There's An AI For That",
        "submit_url": "https://theresanaiforthat.com/submit/",
        "category": "ai",
        "notes": "Submit as multiple entries if you want individual AI tools listed separately.",
    },
    "aiscout": {
        "display_name": "AI Scout",
        "submit_url": "https://aiscout.net/submit",
        "category": "ai",
        "notes": "",
    },
    "saashub": {
        "display_name": "SaaSHub",
        "submit_url": "https://www.saashub.com/",
        "category": "general",
        "notes": "Look for an 'Add a product' link once logged in.",
    },
    "betalist": {
        "display_name": "BetaList",
        "submit_url": "https://betalist.com/submit",
        "category": "startup",
        "notes": "Geared toward pre-launch/early-stage products.",
    },
    "indiehackers": {
        "display_name": "Indie Hackers",
        "submit_url": "https://www.indiehackers.com/products/new",
        "category": "startup",
        "notes": "Community-driven; consider also posting a launch story, not just the listing.",
    },
    "hackernews": {
        "display_name": "Hacker News (Show HN)",
        "submit_url": "https://news.ycombinator.com/showhn.html",
        "category": "startup",
        "notes": "Title must start with 'Show HN:'. No self-promotion tone -- HN penalizes marketing language heavily. Do NOT automate this submission.",
    },
    "slant": {
        "display_name": "Slant",
        "submit_url": "https://www.slant.co/",
        "category": "general",
        "notes": "Question/answer format -- add MyToolVerse as an answer to relevant 'best tool for X' questions.",
    },
    "g2": {
        "display_name": "G2",
        "submit_url": "https://www.g2.com/products/new",
        "category": "general",
        "notes": "Typically expects a more established product with reviews; may require business verification.",
    },
}


# ---------------------------------------------------------------------------
# Status tracking
# ---------------------------------------------------------------------------

def _load_status() -> dict[str, Any]:
    if CACHE_PATH.exists():
        try:
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def _save_status(status: dict[str, Any]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(status, indent=2), encoding="utf-8")


def mark_submitted(key: str) -> bool:
    if key not in DIRECTORIES:
        logger.error(f"Unknown directory key: {key}")
        return False
    status = _load_status()
    status[key] = {"submitted": True, "date": datetime.date.today().isoformat()}
    _save_status(status)
    logger.info(f"Marked {DIRECTORIES[key]['display_name']} as submitted")
    return True


# ---------------------------------------------------------------------------
# Submission copy generation
# ---------------------------------------------------------------------------

def generate_copy_for(key: str) -> str:
    """Formats ready-to-paste submission copy for one directory."""
    d = DIRECTORIES[key]
    return (
        f"--- {d['display_name']} ---\n"
        f"Submit at: {d['submit_url']}\n"
        f"Name: {SITE['name']}\n"
        f"URL: {SITE['url']}\n"
        f"Tagline: {SITE['tagline']}\n"
        f"Short description: {SITE['short_description']}\n"
        f"Long description: {SITE['long_description']}\n"
        f"Tags: {', '.join(SITE['tags'])}\n"
        f"Contact: {SITE['contact_email']}\n"
        + (f"Notes: {d['notes']}\n" if d["notes"] else "")
    )


def print_pending_copy() -> None:
    status = _load_status()
    pending = [k for k in DIRECTORIES if not status.get(k, {}).get("submitted")]

    if not pending:
        print("All directories have been submitted. Nice work!")
        return

    print(f"{len(pending)} of {len(DIRECTORIES)} directories still pending:\n")
    for key in pending:
        print(generate_copy_for(key))
        print()


# ---------------------------------------------------------------------------
# Daily report entry point
# ---------------------------------------------------------------------------

def get_backlink_report() -> dict[str, Any]:
    """Single call used by main.py to fold backlink status into the daily report."""
    status = _load_status()
    submitted = [k for k in DIRECTORIES if status.get(k, {}).get("submitted")]
    pending = [k for k in DIRECTORIES if k not in submitted]

    return {
        "total": len(DIRECTORIES),
        "submitted_count": len(submitted),
        "pending": [
            {"key": k, "name": DIRECTORIES[k]["display_name"], "url": DIRECTORIES[k]["submit_url"]}
            for k in pending
        ],
        "submitted": [
            {"key": k, "name": DIRECTORIES[k]["display_name"], "date": status[k]["date"]}
            for k in submitted
        ],
    }


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "mark" and len(sys.argv) > 2:
        mark_submitted(sys.argv[2])
    elif len(sys.argv) > 1 and sys.argv[1] == "status":
        report = get_backlink_report()
        print(json.dumps(report, indent=2))
    else:
        print_pending_copy()