# Page Views: Migrate from Analytics Engine to D1

## Overview

Replace Cloudflare Analytics Engine with D1 as the storage backend for the page view counter. This simplifies the architecture by removing the REST API query and two secrets, using a single D1 binding for both reads and writes.

All client-side behavior, display logic, and bot filtering remain unchanged.

## What Changes

### Remove
- `analytics_engine_datasets` binding from `wrangler.jsonc`
- `CF_ACCOUNT_ID` and `CF_API_TOKEN` secrets (no longer needed)
- `AnalyticsEngineDataset` interface from `src/env.d.ts`
- `CF_ACCOUNT_ID` and `CF_API_TOKEN` from `RuntimeEnv` type
- REST API query logic (`getViewCount` function) from the API route

### Add
- `d1_databases` binding (`PAGE_VIEWS_DB`) in `wrangler.jsonc`
- D1 migration file to create the `page_views` table with an index
- `D1Database` type in `src/env.d.ts`

### Keep Unchanged
- `src/components/post-meta.astro` — no changes
- `src/pages/blog/[slug].astro` — no changes
- Bot filtering logic (same regex, same behavior)
- Client-side fetch and display behavior
- `VALID_SLUG` regex (kept as defense in depth, though D1 uses parameterized queries)

## Database Schema

A single migration file creates the table and index:

```sql
CREATE TABLE page_views (
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_page_views_slug ON page_views(slug);
```

Each page view inserts one row. Counts are retrieved via `SELECT COUNT(*) as views FROM page_views WHERE slug = ?`. The index on `slug` keeps this fast at any realistic scale for a personal blog.

## API Route Changes

The `POST` handler in `src/pages/api/views/[slug].ts` simplifies:

1. Validate slug (unchanged)
2. Check D1 binding availability (replaces checking three bindings)
3. Bot filter (unchanged)
4. Insert row: `INSERT INTO page_views (slug) VALUES (?)`
5. Query count: `SELECT COUNT(*) as views FROM page_views WHERE slug = ?`
6. Return JSON `{ views: number }`

Both queries use D1's parameterized binding (`.bind(slug)`), eliminating SQL injection risk. The `VALID_SLUG` regex is kept as an additional layer.

The write and read are sequential (insert first so the count includes the current visit). D1 queries are fast enough that this adds negligible latency.

Both D1 operations are wrapped in a try/catch. On any D1 failure, the route returns `{ views: 0 }` (same graceful degradation pattern as the current implementation).

## TypeScript Types

`src/env.d.ts` changes:

- Remove `AnalyticsEngineDataset` interface
- Remove `CF_ACCOUNT_ID` and `CF_API_TOKEN` from `RuntimeEnv`
- Add `D1Database` type (inline declaration to avoid adding `@cloudflare/workers-types`)
- `RuntimeEnv` becomes `{ PAGE_VIEWS_DB?: D1Database }`

```typescript
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  first<T = unknown>(column?: string): Promise<T | null>;
}

interface D1Result {
  success: boolean;
}
```

## Wrangler Config

Replace `analytics_engine_datasets` with `d1_databases`:

```jsonc
"d1_databases": [
  {
    "binding": "PAGE_VIEWS_DB",
    "database_name": "mcnees-page-views",
    "database_id": "<to be filled after creation>"
  }
]
```

The database must be created via `npx wrangler d1 create mcnees-page-views` before deployment.

## Local Development

D1 is available in local dev via `wrangler dev` (uses a local SQLite file). This is an improvement over Analytics Engine, which had no local support. The view counter will work locally after running the migration.

For `astro dev` without wrangler, the binding won't exist and the route returns `{ views: 0 }` (same graceful degradation as before).

## Migration Steps

1. Create the D1 database via wrangler CLI
2. Run the migration to create the table
3. Update wrangler config with the database ID
4. Update TypeScript types
5. Update the API route
6. Deploy
7. Remove `CF_ACCOUNT_ID` and `CF_API_TOKEN` secrets from Cloudflare dashboard (cleanup)

Note: Existing Analytics Engine data will not be migrated. View counts reset to 0. This is acceptable for a personal blog with low existing view counts.

## Files Changed

1. **`wrangler.jsonc`** — Replace `analytics_engine_datasets` with `d1_databases`
2. **`migrations/0001_create_page_views.sql`** — New D1 migration file
3. **`src/env.d.ts`** — Replace `AnalyticsEngineDataset` with `D1Database` types, remove secret fields
4. **`src/pages/api/views/[slug].ts`** — Rewrite to use D1 binding for insert + count query

## Cost

$0 on Cloudflare's free plan. D1 allows 5M reads/day, 100K writes/day, 5GB storage.
