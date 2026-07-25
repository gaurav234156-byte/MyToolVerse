"""
Validation only -- generation of missing schema is a Phase 1.5 step
that reuses REQUIRED_FIELDS below as its template (see reports/generate.py
"Quick Wins" section, which lists exactly what's missing per page so a
human -- or a later AI-content phase -- can fill it in).
"""
from __future__ import annotations

from typing import Any, Dict, List

# Minimum fields we check for per Schema.org @type. Not exhaustive --
# just the ones that actually affect rich-result eligibility.
REQUIRED_FIELDS: Dict[str, List[str]] = {
    "SoftwareApplication": ["name", "applicationCategory", "operatingSystem"],
    "WebApplication": ["name", "applicationCategory"],
    "FAQPage": ["mainEntity"],
    "HowTo": ["name", "step"],
    "BreadcrumbList": ["itemListElement"],
    "Organization": ["name", "url", "logo"],
    "WebSite": ["name", "url"],
    "Article": ["headline", "author", "datePublished"],
    "BlogPosting": ["headline", "author", "datePublished"],
}

REQUIRED_OG_TAGS = ["og:title", "og:description", "og:image", "og:url", "og:type"]
REQUIRED_TWITTER_TAGS = ["twitter:card", "twitter:title", "twitter:description"]


def validate_schema_objects(schema_objects: List[Dict[str, Any]]) -> List[str]:
    """
    Returns a list of human-readable issues. An empty list means either
    the page has no schema at all (caller should flag that separately --
    "no schema" and "invalid schema" are different findings) or every
    object present is valid.
    """
    issues: List[str] = []
    for obj in schema_objects:
        schema_type = obj.get("@type")
        if isinstance(schema_type, list):
            schema_type = schema_type[0] if schema_type else None
        if not schema_type:
            issues.append("A JSON-LD block is missing @type")
            continue

        required = REQUIRED_FIELDS.get(schema_type)
        if required is None:
            continue  # type we don't have a template for -- not an error

        missing = [f for f in required if f not in obj]
        if missing:
            issues.append(f"{schema_type} schema missing: {', '.join(missing)}")

    return issues


def validate_opengraph(og_tags: Dict[str, str]) -> List[str]:
    return [f"missing {tag}" for tag in REQUIRED_OG_TAGS if tag not in og_tags]


def validate_twitter(twitter_tags: Dict[str, str]) -> List[str]:
    return [f"missing {tag}" for tag in REQUIRED_TWITTER_TAGS if tag not in twitter_tags]
