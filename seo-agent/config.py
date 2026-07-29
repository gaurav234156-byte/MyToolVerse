"""
Central configuration for the SEO agent.

Phase 1 (crawler) requires nothing beyond SITE_BASE_URL, which already has
a sane default. Later phases read their own keys from here and simply
report themselves as "not configured" if absent, rather than crashing --
see logger.py's `require_config` helper.
"""
from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

SITE_BASE_URL: str = os.getenv("SITE_BASE_URL", "https://mytoolverse.com").rstrip("/")
MAX_PAGES: int = int(os.getenv("MAX_PAGES", "300"))
CRAWL_DELAY_SECONDS: float = float(os.getenv("CRAWL_DELAY_SECONDS", "0.5"))
USER_AGENT: str = os.getenv(
    "USER_AGENT", "MyToolVerseSEOAgent/1.0 (+https://mytoolverse.com)"
)

DB_PATH: Path = BASE_DIR / "cache" / "seo_agent.sqlite3"
LOG_DIR: Path = BASE_DIR / "logs"
REPORT_DIR: Path = BASE_DIR / "reports"

# --- Phase 2+ keys (optional; None until configured) ---
GSC_CREDENTIALS_JSON = os.getenv("GOOGLE_SEARCH_CONSOLE_CREDENTIALS_JSON")
GA4_CREDENTIALS_JSON = os.getenv("GOOGLE_ANALYTICS_CREDENTIALS_JSON")
BING_WEBMASTER_API_KEY = os.getenv("BING_WEBMASTER_API_KEY")
PAGESPEED_API_KEY = os.getenv("GOOGLE_PAGESPEED_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
GOOGLE_SERVICE_ACCOUNT_KEY_PATH = os.getenv(
    "GOOGLE_SERVICE_ACCOUNT_KEY_PATH",
    "credentials/mytoolverse-seo-473821-b229d4179334.json",
)
GSC_SITE_URL = os.getenv("GSC_SITE_URL", "https://mytoolverse.vercel.app/")
GA4_PROPERTY_ID = os.getenv("GA4_PROPERTY_ID", "547073909")
BING_SITE_URL = os.getenv("BING_SITE_URL", "https://mytoolverse.vercel.app/")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")