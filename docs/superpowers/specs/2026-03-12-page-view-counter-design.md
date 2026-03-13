# Page View Counter Design

## Overview

Add a page view counter to blog posts using Cloudflare Analytics Engine. The counter displays next to the date and reading time in `post-meta.astro`, is fetched via a lightweight client-side request, and costs nothing on Cloudflare's free plan.

Blog posts remain statically generated. Only a small API route is server-rendered.

## Architecture

- **Blog posts stay static** — `[slug].astro` keeps `getStaticPaths()`, no rendering mode change
- **API route is SSR** — A new `src/pages/api/views/[slug].ts` with `export const prerender = false` handles the Analytics Engine write + read
- **Client-side fetch** — A small inline `<script>` on the post page calls the API, gets the count, and renders it into a placeholder element

This preserves all static rendering benefits (Pagefind indexing, edge caching, fast TTFB) while adding the dynamic view count as a progressive enhancement.

## Cloudflare Analytics Engine

### Binding

Add an Analytics Engine binding named `PAGE_VIEWS` in `wrangler.jsonc`:

```jsonc
"analytics_engine_datasets": [
  { "binding": "PAGE_VIEWS", "dataset": "page_views" }
]
```

### Writing Data Points

On each API request, write a data point to Analytics Engine:

- **index1**: The post slug (e.g., `"the-calculator-didnt-kill-accounting"`)
- Only write if the request passes bot filtering (see below)

### Querying Counts

Query Analytics Engine via the Cloudflare REST API:

```
GET https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics_engine/sql
```

With the SQL query:

```sql
SELECT count() as views FROM page_views WHERE index1 = 'the-post-slug'
```

This requires two environment variables/secrets configured in Cloudflare:
- **`CF_ACCOUNT_ID`**: The Cloudflare account ID
- **`CF_API_TOKEN`**: An API token with `Analytics Read` permission

These are set as secrets in the Cloudflare Workers dashboard (not in `wrangler.jsonc`). In the Astro Cloudflare adapter, all bindings, secrets, and env vars are accessible via `Astro.locals.runtime.env` — e.g., `Astro.locals.runtime.env.CF_API_TOKEN`.

Note: The Analytics Engine **binding** (`PAGE_VIEWS`) only supports `writeDataPoint()`. Reading requires the REST API with credentials.

## API Route

### `src/pages/api/views/[slug].ts`

A single `POST` endpoint with `prerender = false`. On each request:

1. Extract the slug from URL params
2. Check User-Agent for bot filtering — if bot, return `{ views: 0 }` without writing
3. Write to Analytics Engine via binding (`writeDataPoint` returns void — fire-and-forget)
4. Query Analytics Engine REST API for the total count (wrapped in try/catch — returns `{ views: 0 }` on failure)
5. Return JSON: `{ views: number }`

Using `POST` because the request has a side effect (writing the data point). The response sets `Cache-Control: no-store` to prevent the browser from caching stale counts. No CORS headers needed since this is a same-origin request.

## Bot Filtering

Before writing a data point, check for bot traffic. Bots still receive a response — they are only excluded from the view count.

Filtering heuristics:
- **Missing User-Agent**: Skip the write (almost always bots)
- **Known bot patterns**: Skip if User-Agent matches a case-insensitive regex test against a pattern like `/bot|crawler|spider|googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot/i`. This is a substring match (e.g., "robot" would also match via "bot")

No IP-based deduplication. Simple and sufficient for a personal blog.

## Display

### Location

The view count appears in `post-meta.astro` as a new flex child in the existing `flex flex-wrap items-center gap-x-3` container, positioned between the date pill and the reading time. It renders as its own `<span>` element with a leading middot, matching the existing reading time pattern: `font-mono text-xs` with `color: oklch(0.45 0.03 250)`.

The element is rendered in the HTML with an empty placeholder (hidden by default). The client-side script populates it and makes it visible once the count is fetched. No loading spinner or skeleton — the count simply appears. If the fetch fails, the element stays hidden.

Example rendering: `[date pill] · 1,423 views · 5 min read`

### Formatting

- Show exact numbers with locale-appropriate separators via `toLocaleString()` (e.g., "1,423 views")
- Singular "view" when count is exactly 1
- Zero views or fetch failure: hide the view count element entirely

### Component Change

`post-meta.astro` gains a new optional `slug` prop (`string | undefined`). When provided, it renders a hidden placeholder `<span>` with a `data-views` attribute set to the slug value. `[slug].astro` passes the slug through to `PostMeta`.

The view count placeholder and its inline `<script>` both live in `post-meta.astro`, keeping the feature self-contained. The script finds the `[data-views]` element, calls the API, and populates it.

View counts only appear on individual post pages (where `slug` is passed). On the blog index or anywhere else `post-meta.astro` is used without a `slug` prop, no placeholder is rendered.

## Data Flow

1. Reader requests `/blog/some-post` — served as static HTML from edge cache
2. Page loads with view count placeholder hidden
3. Inline `<script>` fires a `POST` to `/api/views/some-post`
4. API route (SSR on Cloudflare Worker):
   a. Checks User-Agent; if not a bot, writes a data point to Analytics Engine
   b. Queries Analytics Engine REST API for total count
   c. Returns `{ views: number }`
5. Script receives the count, formats it with `toLocaleString()`, populates the placeholder, and makes it visible
6. If fetch fails or returns 0, the placeholder stays hidden

## Local Development

Analytics Engine is not available in local dev (`astro dev` or `wrangler dev`). The API route checks for the binding's existence:

- If the `PAGE_VIEWS` binding is unavailable, return `{ views: 0 }`
- The client-side script sees 0 views and keeps the placeholder hidden
- No errors, no fallback UI — the page works normally without the counter

## TypeScript

Add the Analytics Engine binding type via a manual declaration in `src/env.d.ts`. The `AnalyticsEngineDataset` interface is declared inline to avoid adding `@cloudflare/workers-types` as a dependency:

```typescript
interface AnalyticsEngineDataset {
  writeDataPoint(event: {
    indexes?: string[];
    doubles?: number[];
    blobs?: (string | ArrayBuffer | null)[];
  }): void;
}
```

This is added to the Cloudflare runtime env type so that `PAGE_VIEWS`, `CF_ACCOUNT_ID`, and `CF_API_TOKEN` are properly typed.

## Files Changed

1. **`wrangler.jsonc`** — Add `analytics_engine_datasets` binding
2. **`src/pages/api/views/[slug].ts`** — New SSR API route for view count write/read
3. **`src/components/post-meta.astro`** — Add optional `slug` prop, hidden placeholder span, and inline `<script>` for fetching/displaying view count
4. **`src/pages/blog/[slug].astro`** — Pass `slug` prop (post.id) to `PostMeta`
5. **`src/env.d.ts`** (or equivalent) — Add Analytics Engine binding type and runtime env types

## Cost

$0 on Cloudflare's free plan. Analytics Engine allows 100,000 writes/day and unlimited reads.

## Constraints

- No new npm dependencies
- No external services
- Blog posts remain statically generated
- Graceful degradation when binding is unavailable or fetch fails
