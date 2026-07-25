import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from crawler.page_analyzer import analyze_page, extract_links  # noqa: E402

SAMPLE_HTML = """
<html>
<head>
  <title>PDF to Word Converter -- Free Online Tool | MyToolVerse</title>
  <meta name="description" content="Convert PDF to Word online for free, no signup required.">
  <link rel="canonical" href="https://mytoolverse.com/tools/pdf/pdf-to-word">
  <meta property="og:title" content="PDF to Word Converter">
  <meta property="og:description" content="Convert PDF to Word online for free.">
  <meta property="og:image" content="https://mytoolverse.com/og.png">
  <meta property="og:url" content="https://mytoolverse.com/tools/pdf/pdf-to-word">
  <meta property="og:type" content="website">
  <script type="application/ld+json">
  {"@context": "https://schema.org", "@type": "SoftwareApplication",
   "name": "PDF to Word Converter", "applicationCategory": "Utility"}
  </script>
</head>
<body>
  <h1>PDF to Word Converter</h1>
  <img src="/icon.png" alt="PDF to Word icon">
  <img src="/banner.png">
  <a href="/tools/pdf/word-to-pdf">Word to PDF</a>
  <a href="https://external-site.com/blog">External link</a>
</body>
</html>
"""


def test_analyze_page_extracts_title_and_meta():
    result = analyze_page(SAMPLE_HTML, "https://mytoolverse.com/tools/pdf/pdf-to-word")
    assert result["title"].startswith("PDF to Word Converter")
    assert "Convert PDF to Word" in result["meta_description"]


def test_analyze_page_counts_h1():
    result = analyze_page(SAMPLE_HTML, "https://mytoolverse.com/tools/pdf/pdf-to-word")
    assert result["h1_count"] == 1


def test_analyze_page_detects_missing_alt():
    result = analyze_page(SAMPLE_HTML, "https://mytoolverse.com/tools/pdf/pdf-to-word")
    assert result["images_total"] == 2
    assert result["images_missing_alt"] == 1


def test_analyze_page_finds_valid_schema():
    result = analyze_page(SAMPLE_HTML, "https://mytoolverse.com/tools/pdf/pdf-to-word")
    assert "SoftwareApplication" in result["schema_types"]
    # operatingSystem is required but missing -- should surface as an issue
    assert any("operatingSystem" in issue for issue in result["schema_issues"])


def test_analyze_page_no_og_issues_when_complete():
    result = analyze_page(SAMPLE_HTML, "https://mytoolverse.com/tools/pdf/pdf-to-word")
    assert result["og_issues"] == []


def test_extract_links_splits_internal_external():
    links = extract_links(
        SAMPLE_HTML, "https://mytoolverse.com/tools/pdf/pdf-to-word", "mytoolverse.com"
    )
    assert "https://mytoolverse.com/tools/pdf/word-to-pdf" in links["internal"]
    assert "https://external-site.com/blog" in links["external"]


def test_missing_title_and_meta_description():
    html = "<html><head></head><body><h1>Test</h1></body></html>"
    result = analyze_page(html, "https://mytoolverse.com/test")
    assert result["title"] is None
    assert result["meta_description"] is None
