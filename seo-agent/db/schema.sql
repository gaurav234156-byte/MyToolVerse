-- MyToolVerse SEO Agent — schema
-- SQLite, committed to the repo so crawl history/diffs work across
-- ephemeral GitHub Actions runs without any external database.

CREATE TABLE IF NOT EXISTS crawl_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    base_url TEXT NOT NULL,
    pages_discovered INTEGER DEFAULT 0,
    pages_crawled INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crawl_run_id INTEGER NOT NULL REFERENCES crawl_runs(id),
    url TEXT NOT NULL,
    status_code INTEGER,
    redirect_chain TEXT,        -- JSON array of hops, if redirected
    title TEXT,
    meta_description TEXT,
    h1_count INTEGER,
    h1_text TEXT,               -- JSON array
    canonical_url TEXT,
    canonical_issue TEXT,       -- NULL if fine, else description
    og_present INTEGER,         -- 1/0
    og_issues TEXT,             -- JSON array of missing/invalid OG tags
    twitter_present INTEGER,
    twitter_issues TEXT,
    images_total INTEGER,
    images_missing_alt INTEGER,
    schema_types TEXT,          -- JSON array of Schema.org @type found
    schema_issues TEXT,         -- JSON array
    in_sitemap INTEGER,         -- 1/0
    discovered_via_links INTEGER, -- 1/0 (found by crawling internal links)
    response_time_ms INTEGER,
    content_hash TEXT           -- for duplicate-page detection
);

CREATE INDEX IF NOT EXISTS idx_pages_crawl_run ON pages(crawl_run_id);
CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url);

CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crawl_run_id INTEGER NOT NULL REFERENCES crawl_runs(id),
    url TEXT NOT NULL,
    category TEXT NOT NULL,     -- e.g. "broken_link", "duplicate_title", "missing_alt"
    severity TEXT NOT NULL,     -- "critical" | "warning" | "info"
    detail TEXT NOT NULL,
    impact INTEGER,             -- 1-5
    difficulty INTEGER,         -- 1-5
    confidence INTEGER,         -- 1-5
    first_seen_run_id INTEGER,  -- earliest crawl_run_id this issue appeared in
    resolved INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_issues_crawl_run ON issues(crawl_run_id);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
