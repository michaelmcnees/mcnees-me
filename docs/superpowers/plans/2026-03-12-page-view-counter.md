# Page View Counter Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a page view counter to blog posts using Cloudflare Analytics Engine, fetched client-side to keep posts static.

**Architecture:** A POST API route (`/api/views/[slug]`) runs on Cloudflare Workers (SSR), writes a data point to Analytics Engine and queries the count via REST API. Blog posts stay static — an inline script in `post-meta.astro` fetches the count after page load and populates a hidden placeholder.

**Tech Stack:** Astro 5, Cloudflare Analytics Engine, Cloudflare Workers, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `wrangler.jsonc` | Modify | Add Analytics Engine dataset binding |
| `src/env.d.ts` | Modify | Add AnalyticsEngineDataset type and runtime env types |
| `src/pages/api/views/[slug].ts` | Create | SSR API route: bot filter, write data point, query count, return JSON |
| `src/components/post-meta.astro` | Modify | Add `slug` prop, hidden view count placeholder, inline fetch script |
| `src/pages/blog/[slug].astro` | Modify | Pass `slug` (post.id) to PostMeta |

---

## Chunk 1: Page View Counter

### Task 1: Cloudflare Binding & TypeScript Types

**Files:**
- Modify: `wrangler.jsonc`
- Modify: `src/env.d.ts`

- [ ] **Step 1: Add Analytics Engine binding to wrangler.jsonc**

Add the `analytics_engine_datasets` array after the `observability` block in `wrangler.jsonc`:

```jsonc
"analytics_engine_datasets": [
  { "binding": "PAGE_VIEWS", "dataset": "page_views" }
]
```

The full file should look like:

```jsonc
{
	"main": "dist/_worker.js/index.js",
	"name": "mcnees-me",
  "compatibility_date": "2026-03-10",
  "compatibility_flags": [
    "nodejs_compat",
    "global_fetch_strictly_public"
  ],
	"assets": {
		"binding": "ASSETS",
		"directory": "./dist"
	},
	"observability": {
    "enabled": true
  },
  "analytics_engine_datasets": [
    { "binding": "PAGE_VIEWS", "dataset": "page_views" }
  ]
}
```

- [ ] **Step 2: Add TypeScript types to src/env.d.ts**

Replace the contents of `src/env.d.ts` with:

```typescript
/// <reference path="../.astro/types.d.ts" />

interface AnalyticsEngineDataset {
  writeDataPoint(event: {
    indexes?: string[];
    doubles?: number[];
    blobs?: (string | ArrayBuffer | null)[];
  }): void;
}

type RuntimeEnv = {
  PAGE_VIEWS?: AnalyticsEngineDataset;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
};

declare namespace App {
  interface Locals {
    runtime: {
      env: RuntimeEnv;
    };
  }
}
```

All bindings/secrets are optional (`?`) because they won't exist in local dev.

- [ ] **Step 3: Verify the project still builds**

Run: `npm run build`
Expected: Build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add wrangler.jsonc src/env.d.ts
git commit -m "feat: add Analytics Engine binding and runtime types for page views"
```

---

### Task 2: API Route

**Files:**
- Create: `src/pages/api/views/[slug].ts`

- [ ] **Step 1: Create the API route file**

Create `src/pages/api/views/[slug].ts`:

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

async function getViewCount(
  accountId: string,
  apiToken: string,
  slug: string
): Promise<number> {
  const query = `SELECT count() as views FROM page_views WHERE index1 = '${slug}'`;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: query,
  });

  if (!response.ok) return 0;

  const text = await response.text();
  // Analytics Engine SQL API returns CSV-like text, parse the count from it
  const lines = text.trim().split("\n");
  if (lines.length < 2) return 0;
  const count = parseInt(lines[1], 10);
  return isNaN(count) ? 0 : count;
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const slug = params.slug;
  if (!slug || !VALID_SLUG.test(slug)) {
    return jsonResponse(0, 400);
  }

  const env = locals.runtime.env;
  const pageViews = env.PAGE_VIEWS;
  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;

  // If bindings aren't available (local dev), return 0
  if (!pageViews || !accountId || !apiToken) {
    return jsonResponse(0);
  }

  // Bots get no write and no query — return 0 immediately
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) {
    return jsonResponse(0);
  }

  // Write data point for non-bot visitors
  pageViews.writeDataPoint({
    indexes: [slug],
  });

  // Query count
  let views = 0;
  try {
    views = await getViewCount(accountId, apiToken, slug);
  } catch {
    // Silently fail — views stays 0
  }

  return jsonResponse(views);
};
```

**Notes on the Analytics Engine SQL API response format:** The API returns data in a text format. The `getViewCount` function parses the count from the response. If the format is different at runtime (e.g., JSON), adjust the parsing accordingly — the try/catch ensures graceful failure either way.

- [ ] **Step 2: Verify the project builds with the new route**

Run: `npm run build`
Expected: Build succeeds. The route should appear in the build output as a server-rendered endpoint.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/views/\[slug\].ts
git commit -m "feat: add API route for page view counting via Analytics Engine"
```

---

### Task 3: Display Component & Client-Side Fetch

**Files:**
- Modify: `src/components/post-meta.astro`
- Modify: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Add slug prop and view count placeholder to post-meta.astro**

Replace the full contents of `src/components/post-meta.astro` with:

```astro
---
interface Props {
  date: Date;
  tags: string[];
  minutesRead?: number;
  slug?: string;
}

const { date, tags, minutesRead, slug } = Astro.props;

const formattedDate = date.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
---
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
  <span class="inline-flex items-center gap-1 font-mono text-xs rounded px-2 py-0.5" style="background: oklch(0.15 0.01 250); color: oklch(0.55 0.04 250);">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="shrink-0" aria-hidden="true">
      <circle cx="4" cy="3.5" r="1.5" fill="currentColor"/>
      <circle cx="4" cy="10.5" r="1.5" fill="currentColor"/>
      <circle cx="10" cy="3.5" r="1.5" fill="currentColor"/>
      <line x1="4" y1="5" x2="4" y2="9" stroke="currentColor" stroke-width="1.2"/>
      <path d="M4 5 Q4 3.5 5.5 3.5 L8.5 3.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
    </svg>
    <time datetime={date.toISOString()}>{formattedDate}</time>
  </span>
  {slug && <span id="view-count" class="font-mono text-xs hidden" style="color: oklch(0.45 0.03 250);" data-views={slug}>&middot; <span data-views-number></span></span>}
  {minutesRead && <span class="font-mono text-xs" style="color: oklch(0.45 0.03 250);">&middot; {minutesRead} min read</span>}
</div>
{tags.length > 0 && (
  <div class="flex flex-wrap gap-2 mt-2">
    {tags.map((tag) => (
      <a href="/blog" class="text-xs text-gray-300 bg-gray-800/50 border border-gray-700 px-2 py-0.5 rounded no-underline hover:text-gray-100 hover:border-gray-600 transition-colors">
        {tag}
      </a>
    ))}
  </div>
)}

{slug && (
  <script is:inline>
    (function() {
      var el = document.querySelector("[data-views]");
      if (!el) return;
      var slug = el.dataset.views;
      fetch("/api/views/" + slug, { method: "POST" })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.views > 0) {
            var numberEl = el.querySelector("[data-views-number]");
            if (numberEl) {
              var label = data.views === 1 ? "view" : "views";
              numberEl.textContent = data.views.toLocaleString() + " " + label;
              el.classList.remove("hidden");
            }
          }
        })
        .catch(function() {});
    })();
  </script>
)}
```

**Key changes from original:**
- Added optional `slug` prop to the interface
- Added hidden `#view-count` span between date pill and reading time (only rendered when `slug` is provided)
- Added `<script is:inline>` that fetches the count and reveals the element. Using `is:inline` prevents Astro from hoisting/bundling the script — it only appears in the HTML when `slug` is provided. Plain JS (no TypeScript) since `is:inline` scripts aren't processed.
- All existing markup preserved exactly

- [ ] **Step 2: Pass slug prop from [slug].astro to PostMeta**

In `src/pages/blog/[slug].astro`, change the PostMeta usage from:

```astro
      <PostMeta
        date={post.data.date}
        tags={post.data.tags}
        minutesRead={minutesRead}
      />
```

to:

```astro
      <PostMeta
        date={post.data.date}
        tags={post.data.tags}
        minutesRead={minutesRead}
        slug={post.id}
      />
```

- [ ] **Step 3: Verify the project builds**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Test locally**

Run: `npm run dev`

1. Open a blog post in the browser
2. Check the browser's Network tab — you should see a POST to `/api/views/<slug>`
3. The API should return `{ views: 0 }` (no Analytics Engine in local dev)
4. The view count element should remain hidden (correct behavior for 0 views)
5. Verify the date and reading time still display correctly

- [ ] **Step 5: Commit**

```bash
git add src/components/post-meta.astro src/pages/blog/\[slug\].astro
git commit -m "feat: add view count display to blog post metadata"
```

---

### Task 4: Production Deployment & Verification

- [ ] **Step 1: Set Cloudflare secrets**

In the Cloudflare Workers dashboard (or via CLI), set the two secrets:

```bash
npx wrangler secret put CF_ACCOUNT_ID
# Enter your Cloudflare account ID when prompted

npx wrangler secret put CF_API_TOKEN
# Enter an API token with Account Analytics:Read permission when prompted
```

**Note:** You also need to enable the Analytics Engine dataset in your Cloudflare dashboard under Workers > Analytics Engine. Create a dataset named `page_views` if it doesn't exist.

- [ ] **Step 2: Deploy**

```bash
npm run build && npx wrangler deploy
```

- [ ] **Step 3: Verify in production**

1. Open a blog post on the live site
2. Check the Network tab — POST to `/api/views/<slug>` should return `{ views: N }` where N > 0
3. The view count should appear between the date and reading time
4. Refresh the page — the count should increment by 1
5. Check that the blog index page does NOT show view counts (no `slug` prop passed)
