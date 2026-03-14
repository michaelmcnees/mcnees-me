CREATE TABLE page_views (
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_page_views_slug ON page_views(slug);
