"""
Fire-and-forget notifications. Every function checks its own config
and simply logs + returns if not set up -- the daily run should never
fail just because you haven't wired up Discord yet.
"""
from __future__ import annotations

import requests

import config
from logger import get_logger

log = get_logger(__name__)


def notify_all(summary_text: str) -> None:
    _notify_discord(summary_text)
    _notify_slack(summary_text)
    _notify_telegram(summary_text)


def _notify_discord(text: str) -> None:
    if not config.DISCORD_WEBHOOK_URL:
        log.debug("Discord webhook not configured -- skipping")
        return
    try:
        requests.post(config.DISCORD_WEBHOOK_URL, json={"content": text[:1900]}, timeout=10)
    except requests.RequestException as exc:
        log.warning("Discord notification failed: %s", exc)


def _notify_slack(text: str) -> None:
    if not config.SLACK_WEBHOOK_URL:
        log.debug("Slack webhook not configured -- skipping")
        return
    try:
        requests.post(config.SLACK_WEBHOOK_URL, json={"text": text[:3000]}, timeout=10)
    except requests.RequestException as exc:
        log.warning("Slack notification failed: %s", exc)


def _notify_telegram(text: str) -> None:
    if not (config.TELEGRAM_BOT_TOKEN and config.TELEGRAM_CHAT_ID):
        log.debug("Telegram not configured -- skipping")
        return
    try:
        url = f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/sendMessage"
        requests.post(
            url,
            json={"chat_id": config.TELEGRAM_CHAT_ID, "text": text[:4000]},
            timeout=10,
        )
    except requests.RequestException as exc:
        log.warning("Telegram notification failed: %s", exc)
