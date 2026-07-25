import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from crawler.issue_detector import detect_issues  # noqa: E402


def _base_page(**overrides):
    page = {
        "url": "https://mytoolverse.com/tools/pdf/pdf-to-word",
        "status_code": 200,
        "redirect_chain": [],
        "title": "PDF to Word Converter | MyToolVerse",
        "meta_description": "Convert PDF to Word online for free.",
        "h1_count": 1,
        "images_total": 5,
        "images_missing_alt": 0,
        "canonical_issue": None,
        "og_issues": [],
        "twitter_issues": [],
        "schema_types": ["SoftwareApplication"],
        "schema_issues": [],
        "in_sitemap": True,
        "discovered_via_links": True,
        "content_hash": "abc123",
    }
    page.update(overrides)
    return page


def test_detects_404():
    issues = detect_issues([_base_page(status_code=404)])
    categories = [i["category"] for i in issues]
    assert "broken_link" in categories


def test_detects_missing_title():
    issues = detect_issues([_base_page(title=None)])
    categories = [i["category"] for i in issues]
    assert "missing_title" in categories


def test_detects_missing_alt_text():
    issues = detect_issues([_base_page(images_missing_alt=3)])
    matches = [i for i in issues if i["category"] == "missing_alt_text"]
    assert len(matches) == 1
    assert "3 of 5" in matches[0]["detail"]


def test_detects_duplicate_titles_across_pages():
    pages = [
        _base_page(url="https://mytoolverse.com/a", title="Same Title"),
        _base_page(url="https://mytoolverse.com/b", title="Same Title"),
    ]
    issues = detect_issues(pages)
    dupes = [i for i in issues if i["category"] == "duplicate_title"]
    assert len(dupes) == 2  # one finding per affected page


def test_detects_orphan_page():
    issues = detect_issues([_base_page(in_sitemap=True, discovered_via_links=False)])
    categories = [i["category"] for i in issues]
    assert "orphan_page" in categories


def test_no_false_positive_on_clean_page():
    issues = detect_issues([_base_page()])
    assert issues == []


def test_detects_redirect_chain():
    issues = detect_issues([_base_page(redirect_chain=["a", "b", "c"])])
    categories = [i["category"] for i in issues]
    assert "redirect_chain" in categories
