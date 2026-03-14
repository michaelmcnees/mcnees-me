# Page Views D1 Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate page view counter storage from Cloudflare Analytics Engine to D1.

**Architecture:** Replace the Analytics Engine binding + REST API query with a single D1 database binding. The API route inserts a row per view and queries `COUNT(*)`. All client-side code stays unchanged.

**Tech Stack:** Astro 5, Cloudflare D1, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `migrations/0001_create_page_views.sql` | Create | D1 migration: table + index |
| `wrangler.jsonc` | Modify | Replace `analytics_engine_datasets` with `d1_databases` |
| `src/env.d.ts` | Modify | Replace `AnalyticsEngineDataset` with D1 types |
| `src/pages/api/views/[slug].ts` | Modify | Rewrite to use D1 for insert + count |

---

## Chunk 1: D1 Migration

### Task 1: Create D1 Database & Migration

**Files:**
- Create: `migrations/0001_create_page_views.sql`

- [ ] **Step 1: Create the D1 database**

Run:
```bash
npx wrangler d1 create mcnees-page-views
```

Expected: Output includes a `database_id` — copy it for the next task.

- [ ] **Step 2: Create the migration file**

Create `migrations/0001_create_page_views.sql`:

```sql
CREATE TABLE page_views (
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_page_views_slug ON page_views(slug);
```

- [ ] **Step 3: Commit**

```bash
git add migrations/0001_create_page_views.sql
git commit -m "feat: add D1 migration for page views table"
```

---

### Task 2: Update Wrangler Config & TypeScript Types

**Files:**
- Modify: `wrangler.jsonc`
- Modify: `src/env.d.ts`

- [ ] **Step 1: Replace Analytics Engine binding with D1 in wrangler.jsonc**

In `wrangler.jsonc`, replace the `analytics_engine_datasets` block:

```jsonc
"analytics_engine_datasets": [
    {
        "binding": "PAGE_VIEWS",
        "dataset": "page_views"
    },
],
```

with:

```jsonc
"d1_databases": [
    {
        "binding": "PAGE_VIEWS_DB",
        "database_name": "mcnees-page-views",
        "database_id": "<paste the ID from Task 1 Step 1>"
    },
],
```

- [ ] **Step 2: Replace TypeScript types in src/env.d.ts**

Replace the full contents of `src/env.d.ts` with:

```typescript
/// <reference path="../.astro/types.d.ts" />

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

type RuntimeEnv = {
  PAGE_VIEWS_DB?: D1Database;
};

declare namespace App {
  interface Locals {
    runtime: {
      env: RuntimeEnv;
    };
  }
}
```

- [ ] **Step 3: Verify the project builds**

Run: `npm run build`
Expected: Build succeeds (the API route will have type errors — that's expected, we fix it in Task 3).

Note: The build may fail due to the API route still referencing old types. If so, that's fine — proceed to Task 3.

- [ ] **Step 4: Commit**

```bash
git add wrangler.jsonc src/env.d.ts
git commit -m "feat: switch from Analytics Engine to D1 binding and types"
```

---

### Task 3: Rewrite API Route for D1

**Files:**
- Modify: `src/pages/api/views/[slug].ts`

- [ ] **Step 1: Replace the API route with D1 implementation**

Replace the full contents of `src/pages/api/views/[slug].ts` with:

```typescript
import type { APIRoute } from "astro";

export const prerender = false;

const VALID_SLUG = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const BOT_PATTERN =
  /bot|crawler|spider|googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot/i;

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
} as const;

function jsonResponse(views: number, status = 200): Response {
  return new Response(JSON.stringify({ views }), {
    status,
    headers: JSON_HEADERS,
  });
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const slug = params.slug;
  if (!slug || !VALID_SLUG.test(slug)) {
    return jsonResponse(0, 400);
  }

  const db = locals.runtime.env.PAGE_VIEWS_DB;

  // If binding isn't available (local dev without wrangler), return 0
  if (!db) {
    return jsonResponse(0);
  }

  // Bots get no write and no query — return 0 immediately
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) {
    return jsonResponse(0);
  }

  let views = 0;
  try {
    // Insert row for this view
    await db.prepare("INSERT INTO page_views (slug) VALUES (?)").bind(slug).run();

    // Query total count
    const result = await db
      .prepare("SELECT COUNT(*) as views FROM page_views WHERE slug = ?")
      .bind(slug)
      .first<{ views: number }>();

    views = result?.views ?? 0;
  } catch {
    // Silently fail — views stays 0
  }

  return jsonResponse(views);
};
```

**What changed from the current file:**
- Removed `getViewCount` function (no more REST API call)
- Removed `AnalyticsEngineDataset` usage (`writeDataPoint`)
- Removed `CF_ACCOUNT_ID` and `CF_API_TOKEN` references
- Single binding check (`db`) instead of three
- D1 `INSERT` + `SELECT COUNT(*)` with parameterized queries
- Sequential write then read (count includes current visit)

- [ ] **Step 2: Verify the project builds**

Run: `npm run build`
Expected: Build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/views/\[slug\].ts
git commit -m "feat: rewrite page view API route to use D1"
```

---

### Task 4: Deploy & Verify

- [ ] **Step 1: Run the D1 migration on the remote database**

```bash
npx wrangler d1 migrations apply mcnees-page-views --remote
```

Expected: Migration applies successfully, creates `page_views` table and index.

- [ ] **Step 2: Deploy**

```bash
npm run build && npx wrangler deploy
```

- [ ] **Step 3: Verify in production**

1. Open a blog post on the live site
2. Check the Network tab — POST to `/api/views/<slug>` should return `{ views: 1 }`
3. Refresh — count should increment to 2
4. Verify the view count appears on the page between date and reading time

- [ ] **Step 4: Clean up old secrets**

Remove the Analytics Engine secrets that are no longer needed:

```bash
npx wrangler secret delete CF_ACCOUNT_ID
npx wrangler secret delete CF_API_TOKEN
```

- [ ] **Step 5: Commit any remaining changes**

If any files changed during deployment (e.g., wrangler.jsonc database_id update):

```bash
git add -A
git commit -m "chore: finalize D1 migration deployment config"
```
