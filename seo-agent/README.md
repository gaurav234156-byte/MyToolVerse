# MyToolVerse SEO Agent

Autonomous daily SEO crawler + reporter for mytoolverse.com. Lives
inside the main MyToolVerse repo as an independent Python subsystem —
it doesn't touch or depend on the Next.js app code at all.

## Phase 1 (this drop): technical + on-page crawl, zero API keys needed

**What it does every run:**
- Crawls the live site with a real browser (Playwright, so client-rendered
  Next.js content is seen correctly)
- Pulls sitemap.xml + robots.txt and cross-checks them against what's
  actually reachable by links (orphan pages, missing-from-sitemap pages)
- Per page: title/meta description, H1s, alt text coverage, canonical
  tag, OpenGraph tags, Twitter Card tags, Schema.org JSON-LD (validated
  against required fields per type), redirect chains, status codes
- Detects duplicate titles / meta descriptions / near-duplicate content
  across pages
- Scores every finding 1–5 on impact/difficulty/confidence and ranks a
  "Quick Wins" list
- Diffs against the previous run so the report leads with what's *new*
- Writes `reports/YYYY-MM-DD.{md,json,html}`
- Posts a one-line summary to Discord/Slack/Telegram *if* you've set
  those webhooks — otherwise silently skips, no crash
- A static, editable checklist of free directories to submit to
  (Product Hunt, AlternativeTo, Futurepedia, etc.) with status tracked
  in `cache/directory_status.json`

## Setup

```bash
cd seo-agent
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
playwright install chromium
cp .env.example .env          # Phase 1 needs no values filled in
python main.py
```

Check `reports/` for today's output and `logs/` for the run log.

## Running daily via GitHub Actions

Already wired up in `.github/workflows/seo-daily.yml` — runs at 04:00
UTC, commits the report + updated crawl-history database back to the
repo. No secrets needed for Phase 1. Trigger it manually anytime from
the repo's **Actions** tab ("Run workflow") to test it without waiting
for the cron.

## Why SQLite instead of PostgreSQL

GitHub Actions runners are ephemeral — nothing persists between runs
unless it's committed back to the repo or lives in an external DB.
Standing up and paying for a hosted Postgres instance is real
infrastructure most of this doesn't need yet. `seo-agent/cache/seo_agent.sqlite3`
is committed to the repo after every run, which gives free, versioned
crawl history with zero hosting. If this ever needs to scale past what
SQLite comfortably handles, that's a sign Phase 2+ is working and
worth the infra investment then.

## Roadmap (not built yet — needs credentials you don't have)

| Phase | Needs | Unlocks |
|---|---|---|
| 2 | Google Search Console + GA4 (free, ~15 min OAuth setup) | Real ranking/traffic data, accurate quick-win detection, keyword cannibalization from actual query data |
| 3 | OpenAI or Anthropic API key | Draft meta titles/descriptions, FAQ/HowTo schema generation, draft blog/comparison content — all as PR suggestions, never auto-published |
| 3b | Manual, periodic | AI-search-citation spot checks (ChatGPT/Perplexity) — there's no API that reports "AI visibility," so this is a checklist you or the agent runs against target queries, not a live dashboard |
| 4 | Ahrefs or SEMrush (paid) | Real backlink/competitor data — skipped until you decide it's worth the subscription |

## Project layout

```
seo-agent/
  config.py          # env-driven config, all Phase 2+ keys optional
  logger.py           # shared logging setup
  main.py              # daily orchestrator
  crawler/
    sitemap.py          # sitemap.xml + robots.txt fetch/validate
    crawl.py             # Playwright BFS crawl
    page_analyzer.py      # HTML -> SEO signals (pure function, unit tested)
    issue_detector.py      # signals -> scored issues (pure function, unit tested)
    diff.py                 # this run's issues vs last run's
  technical/
    schema_validator.py     # Schema.org / OG / Twitter validation rules
    directories.py           # free directory submission checklist
  reports/
    generate.py               # builds .md / .json / .html report
  db/
    schema.sql
    database.py
  utils/
    retry.py
    notify.py
  tests/
    test_page_analyzer.py
    test_issue_detector.py
```

## Running tests

```bash
pip install pytest
pytest tests/ -v
```
