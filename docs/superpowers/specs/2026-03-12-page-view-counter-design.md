# Page View Counter Design

## Overview

Add a server-rendered page view counter to blog posts using Cloudflare Analytics Engine. The counter displays next to the date and reading time in `post-meta.astro`, requires no client-side JavaScript, and costs nothing on Cloudflare's free plan.

## Rendering Mode Change

Keep `output: 'static'` in `astro.config.mjs` (Astro 5 removed the `'hybrid'` option). In Astro 5, `output: 'static'` already supports per-route opt-in to SSR via `export const prerender = false` when an adapter is present.

Only `src/pages/blog/[slug].astro` opts into server-side rendering via `export const prerender = false`, replacing the current `getStaticPaths()` approach. All other pages remain statically generated.

## Cloudflare Analytics Engine

### Binding

Add an Analytics Engine binding named `PAGE_VIEWS` in `wrangler.jsonc`:

```jsonc
"analytics_engine_datasets": [
  { "binding": "PAGE_VIEWS", "dataset": "page_views" }
]
```

### Writing Data Points

On each blog post request, write a data point to Analytics Engine:

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

Note: The Analytics Engine **binding** (`PAGE_VIEWS`) only supports `writeDataPoint()`. Reading requires the REST API with credentials. The write (via binding) and query (via REST API) execute in parallel to minimize latency. The returned count will not include the current visit, which is acceptable (off by one at most).

## Bot Filtering

Before writing a data point, check for bot traffic. Bots still receive the full page content — they are only excluded from the view count.

Filtering heuristics:
- **Missing User-Agent**: Skip the write (almost always bots)
- **Known bot patterns**: Skip if User-Agent matches a case-insensitive regex test against a pattern like `/bot|crawler|spider|googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot/i`. This is a substring match (e.g., "robot" would also match via "bot")

No IP-based deduplication. Simple and sufficient for a personal blog.

## Display

### Location

The view count appears in `post-meta.astro` as a new flex child in the existing `flex flex-wrap items-center gap-x-3` container, positioned between the date pill and the reading time. It renders as its own `<span>` element with a leading middot, matching the existing reading time pattern: `font-mono text-xs` with `color: oklch(0.45 0.03 250)`.

Example rendering: `[date pill] · 142 views · 5 min read`

### Formatting

- Under 1,000: exact number (e.g., "142 views")
- 1,000–999,999: one decimal with "k" suffix (e.g., "1.4k views")
- 1,000,000+: one decimal with "m" suffix (e.g., "1.8m views")
- Singular "view" when count is exactly 1
- Zero views: hide the view count entirely (same as undefined)

### Props Change

`post-meta.astro` gains an optional `views` prop (`number | undefined`). When undefined (local dev or error), the view count element is not rendered — same conditional pattern as `minutesRead`.

## Data Flow

1. Reader requests `/blog/some-post`
2. Cloudflare Worker handles the request (SSR)
3. `[slug].astro` extracts the slug from URL params, fetches the post via `getEntry('blog', slug)` (replacing the `getCollection`/`getStaticPaths` pattern). Returns 404 if not found or if draft.
4. In parallel:
   a. Check User-Agent; if not a bot, fire-and-forget write to Analytics Engine via binding (no need to await — `writeDataPoint` is synchronous/void)
   b. Query Analytics Engine REST API for the total count for this slug. Wrapped in try/catch — on failure, `views` is `undefined` and the counter is simply not shown.
5. Pass the count to `PostMeta` as the `views` prop
6. HTML renders with the count included — no client-side JS

## Caching

Since blog posts move from static files to SSR, they lose automatic edge caching. To avoid a latency regression, set a `Cache-Control` header on the SSR response via `Astro.response.headers.set()`:

```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

This tells Cloudflare's edge to cache the rendered HTML for 60 seconds, with stale-while-revalidate allowing cached responses for up to 5 minutes while a fresh one is fetched in the background. The view count will be at most ~60 seconds stale, which is perfectly fine.

## Pagefind Compatibility

Pagefind indexes static HTML at build time. Since `[slug].astro` moves to SSR (`prerender = false`), blog post pages won't be pre-rendered at build time and Pagefind won't be able to index them.

To solve this, add a separate static page that pre-renders all blog posts for Pagefind indexing only. Create `src/pages/blog/_index/[slug].astro` with `data-pagefind-body` — this page is statically generated (keeping `getStaticPaths`) and exists solely so Pagefind can index the content. It does not need the view count. Add this path to the Pagefind configuration so it indexes the static copies, while the live `/blog/[slug]` route serves the SSR version with view counts.

Alternatively, if `astro-pagefind` supports indexing SSR routes or custom content sources, that approach is preferable. Investigate during implementation.

## Local Development

Analytics Engine is not available in local dev (`astro dev` or `wrangler dev`). The code checks for the binding's existence:

- If the `PAGE_VIEWS` binding is unavailable, skip both the write and query
- The `views` prop will be `undefined`, and `post-meta.astro` simply won't render the count
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
2. **`src/pages/blog/[slug].astro`** — Remove `getStaticPaths()`, add `prerender = false`, fetch post via `getEntry`, add Analytics Engine write/query logic, pass `views` to `PostMeta`
3. **`src/components/post-meta.astro`** — Add optional `views` prop, render view count between date pill and reading time
4. **`src/env.d.ts`** (or equivalent) — Add Analytics Engine binding type and runtime env types

## Cost

$0 on Cloudflare's free plan. Analytics Engine allows 100,000 writes/day and unlimited reads.

## Constraints

- No new npm dependencies
- No client-side JavaScript for the counter
- No external services
- Graceful degradation when binding is unavailable
