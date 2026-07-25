"""
Shared logging setup. Every module does:
    from logger import get_logger
    log = get_logger(__name__)

Also provides `require_config`, which later-phase modules use to fail
loudly but gracefully when a key isn't set yet, instead of crashing
the whole daily run.
"""
from __future__ import annotations

import logging
import sys
from datetime import datetime, timezone

import config

config.LOG_DIR.mkdir(parents=True, exist_ok=True)

_LOG_FILE = config.LOG_DIR / f"{datetime.now(timezone.utc):%Y-%m-%d}.log"

_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

logging.basicConfig(
    level=logging.INFO,
    format=_FORMAT,
    handlers=[
        logging.FileHandler(_LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


class ConfigNotSetError(RuntimeError):
    """Raised when a module needs a credential that isn't configured yet."""


def require_config(value, human_name: str, setup_hint: str):
    """
    Use at the top of any Phase 2+ function that needs a credential.
    Raises a clear, actionable error instead of a confusing crash.
    """
    if not value:
        raise ConfigNotSetError(
            f"{human_name} is not configured. {setup_hint} "
            f"Set it in seo-agent/.env and re-run."
        )
    return value
