"""
Thin SQLite wrapper. No ORM -- this schema is small and stable enough
that raw SQL is more debuggable than an ORM layer, and it keeps
requirements.txt short.
"""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path

import config

_SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def _ensure_db_dir() -> None:
    config.DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def init_db() -> None:
    """Create tables if they don't exist yet. Safe to call every run."""
    _ensure_db_dir()
    with get_connection() as conn:
        conn.executescript(_SCHEMA_PATH.read_text(encoding="utf-8"))
        conn.commit()


@contextmanager
def get_connection():
    _ensure_db_dir()
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()
