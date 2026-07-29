"""
content.py
Generates full blog-post drafts for MyToolVerse using Gemini (free
tier), sourced from topic ideas the agent has already surfaced
(striking-distance keywords, autocomplete suggestions, competitor
catalog gaps).

Drafts are saved as markdown files for human review -- nothing is
auto-published. The site doesn't have a blog route yet, so this is
step one: build a backlog of ready-to-review drafts; publishing them
is a separate follow-up (adding a /blog route to the Next.js app).

Uses Gemini 3.5 Flash, which has a genuine free tier (rate-limited,
no credit card required) -- well within reach at 1-2 drafts/day.

Requires:
    pip install google-generativeai --break-system-packages

Env vars expected (seo-agent/.env):
    GEMINI_API_KEY -> from aistudio.google.com/apikey (same key used
                       elsewhere in the project, e.g. root .env.local)
"""

from __future__ import annotations

import json
import re
import datetime
from pathlib import Path
from typing import Any

import google.generativeai as genai

from config import BASE_DIR, GEMINI_API_KEY
from logger import get_logger

logger = get_logger(__name__)

DRAFTS_DIR = BASE_DIR / "content" / "drafts"
CACHE_PATH = BASE_DIR / "cache" / "content.json"

MODEL = "gemini-3.5-flash"
MAX_DRAFTS_PER_RUN = 2  # stay comfortably within the free tier's daily request limit

SYSTEM_PROMPT = """You are a content writer for MyToolVerse, a free all-in-one \
online toolbox (100+ tools: PDF, image, AI, text, developer, calculator, video, \
audio, student, and business tools). Write a genuinely useful, non-salesy blog \
post that helps the reader accomplish a real task. Naturally mention a relevant \
MyToolVerse tool once or twice where it fits the reader's task, using this \
format: [Tool Name](https://mytoolverse.vercel.app/tools/CATEGORY/SLUG) -- but \
the article must stand on its own even if the reader ignores the tool. \
No fluff, no keyword stuffing, no generic AI-writing tics ("in today's fast-paced \
world", "unlock the power of"). Write like a knowledgeable person explaining \
something to a friend.

Return ONLY valid JSON with these exact keys, nothing else, no markdown code fences:
{
  "title": "...",
  "meta_description": "under 155 characters",
  "slug": "url-friendly-slug",
  "body_markdown": "the full article in markdown, using ## for headers, 700-1000 words"
}"""


# ---------------------------------------------------------------------------
# Topic selection
# ---------------------------------------------------------------------------

def _load_cache() -> dict[str, Any]:
    if CACHE_PATH.exists():
        try:
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {"used_topics": []}
    return {"used_topics": []}


def _save_cache(cache: dict[str, Any]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, indent=2), encoding="utf-8")


def select_topics(
    keyword_report: dict[str, Any] | None,
    competitor_report: dict[str, Any] | None,
    limit: int = MAX_DRAFTS_PER_RUN,
) -> list[str]:
    """
    Pulls topic candidates from striking-distance keywords, autocomplete
    suggestions, and competitor gap analysis -- skipping anything already
    used for a previous draft.
    """
    cache = _load_cache()
    used = set(cache.get("used_topics", []))
    candidates: list[str] = []

    if keyword_report:
        for o in keyword_report.get("striking_distance", {}).get("opportunities", []):
            candidates.append(o["query"])
        for seed, suggestions in keyword_report.get("suggestions", {}).get("suggestions", {}).items():
            candidates.extend(suggestions)

    if competitor_report:
        for data in competitor_report.values():
            candidates.extend(data.get("gap_candidates", []))

    fresh = [c for c in dict.fromkeys(candidates) if c.lower() not in used]
    return fresh[:limit]


# ---------------------------------------------------------------------------
# Draft generation
# ---------------------------------------------------------------------------

def generate_draft(topic: str) -> dict[str, Any]:
    """Calls Gemini to draft a full blog post for one topic."""
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not configured in seo-agent/.env")

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(MODEL, system_instruction=SYSTEM_PROMPT)
    response = model.generate_content(
        f'Write a blog post for this topic/search query: "{topic}"'
    )

    raw_text = response.text.strip()
    raw_text = re.sub(r"^```json\s*|\s*```$", "", raw_text)

    try:
        draft = json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Gemini did not return valid JSON for topic '{topic}': {e}")

    required = {"title", "meta_description", "slug", "body_markdown"}
    if not required.issubset(draft):
        raise RuntimeError(f"Draft for '{topic}' missing required fields: {required - draft.keys()}")

    return draft


def save_draft(draft: dict[str, Any], topic: str) -> Path:
    """Writes a draft to content/drafts/ as a markdown file with frontmatter."""
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{draft['slug']}.md"
    path = DRAFTS_DIR / filename

    frontmatter = (
        "---\n"
        f"title: \"{draft['title']}\"\n"
        f"meta_description: \"{draft['meta_description']}\"\n"
        f"slug: \"{draft['slug']}\"\n"
        f"source_topic: \"{topic}\"\n"
        f"generated: \"{datetime.date.today().isoformat()}\"\n"
        "status: draft\n"
        "---\n\n"
    )

    path.write_text(frontmatter + draft["body_markdown"], encoding="utf-8")
    return path


# ---------------------------------------------------------------------------
# Daily report entry point
# ---------------------------------------------------------------------------

def get_content_report(
    keyword_report: dict[str, Any] | None = None,
    competitor_report: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Selects fresh topics, generates a draft for each (capped at
    MAX_DRAFTS_PER_RUN), saves them to content/drafts/, and returns a
    summary for main.py to fold into the daily report.
    """
    topics = select_topics(keyword_report, competitor_report)
    if not topics:
        logger.info("Content generation: no fresh topics to draft this run")
        return {"drafts": [], "topics_considered": 0}

    cache = _load_cache()
    used = cache.setdefault("used_topics", [])
    drafts_written = []

    for topic in topics:
        try:
            draft = generate_draft(topic)
            path = save_draft(draft, topic)
            drafts_written.append({
                "title": draft["title"],
                "slug": draft["slug"],
                "path": str(path.relative_to(BASE_DIR)),
                "source_topic": topic,
            })
            used.append(topic.lower())
            logger.info(f"Content draft OK: '{draft['title']}' ({path.name})")
        except Exception as e:
            logger.error(f"Content draft failed for topic '{topic}': {e}")

    _save_cache(cache)
    return {"drafts": drafts_written, "topics_considered": len(topics)}


if __name__ == "__main__":
    # Standalone test: draft one post for a sample topic
    sample_topic = "pdf compressor to 200kb"
    draft = generate_draft(sample_topic)
    path = save_draft(draft, sample_topic)
    print(f"Draft saved to: {path}")
    print(json.dumps({k: v for k, v in draft.items() if k != "body_markdown"}, indent=2))