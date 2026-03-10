# mcnees.me Site Refresh — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild mcnees.me from Next.js to Astro with MDX blog support, deployed to Cloudflare Pages.

**Architecture:** Astro static site with Content Collections for MDX blog posts, React islands for interactive search and tag filtering, Pagefind for client-side search. Minimal dark design with Tailwind CSS v4.

**Tech Stack:** Astro, React, TypeScript, Tailwind CSS v4, MDX, Pagefind, Cloudflare Pages

**File naming:** All files use kebab-case. Component function names use PascalCase.

**Spec:** `docs/superpowers/specs/2026-03-09-site-refresh-design.md`

---

## Chunk 1: Project Scaffolding & Core Layout

### Task 1: Initialize Astro Project

**Files:**
- Create: `astro.config.mjs`
- Create: `src/env.d.ts`
- Create: `tsconfig.json` (replace existing)
- Modify: `package.json` (replace existing)
- Remove: `src/pages/_app.tsx`, `src/pages/_document.tsx`, `src/pages/index.tsx`
- Remove: `next.config.js`, `next-env.d.ts`, `postcss.config.js`
- Remove: `src/index.css`

This is a full framework swap. We remove the old Next.js project and scaffold Astro in place.

- [ ] **Step 1: Remove old Next.js files and node_modules**

```bash
rm -rf node_modules package-lock.json
rm -f next.config.js next-env.d.ts postcss.config.js src/index.css
rm -f src/pages/_app.tsx src/pages/_document.tsx src/pages/index.tsx
rmdir src/pages
```

- [ ] **Step 2: Initialize Astro project**

```bash
npm create astro@latest . -- --template minimal --typescript strict --install --no-git
```

Use `--template minimal` for a clean start. The `--no-git` flag keeps our existing git repo.

- [ ] **Step 3: Install integrations and dependencies**

```bash
npx astro add react tailwind cloudflare mdx --yes
npm install pagefind
```

This installs:
- `@astrojs/react` + `react` + `react-dom` — React island support
- `@astrojs/tailwind` — Tailwind CSS v4 integration
- `@astrojs/cloudflare` — Cloudflare Pages adapter
- `@astrojs/mdx` — MDX support for content
- `pagefind` — static search indexing

- [ ] **Step 4: Configure astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://mcnees.me',
  output: 'static',
  adapter: cloudflare(),
  integrations: [
    react(),
    tailwind(),
    mdx({
      shikiConfig: {
        theme: 'github-dark-default',
      },
    }),
  ],
});
```

- [ ] **Step 5: Configure TypeScript**

Update `tsconfig.json` to use Astro's strict preset:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 6: Create global CSS file**

Create `src/styles/global.css`:

```css
@import "tailwindcss";

html {
  @apply bg-gray-950 text-gray-400 antialiased;
}

body {
  @apply min-h-screen;
}

a {
  @apply text-sky-400 hover:text-sky-300 transition-colors;
}

/* Prose overrides for blog content */
.prose {
  @apply text-gray-400 max-w-none;
}
.prose h1, .prose h2, .prose h3, .prose h4 {
  @apply text-gray-100;
}
.prose a {
  @apply text-sky-400 hover:text-sky-300;
}
.prose strong {
  @apply text-gray-200;
}
.prose code {
  @apply text-gray-300 bg-gray-900 px-1.5 py-0.5 rounded text-sm;
}
.prose pre {
  @apply bg-gray-900 border border-gray-800 rounded-lg;
}
.prose blockquote {
  @apply border-gray-700 text-gray-500;
}
.prose ul > li::marker, .prose ol > li::marker {
  @apply text-gray-600;
}
.prose hr {
  @apply border-gray-800;
}
```

- [ ] **Step 7: Create a minimal index page to verify setup**

Create `src/pages/index.astro`:

```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Michael McNees</title>
  </head>
  <body>
    <h1>mcnees.me</h1>
    <p>Site rebuild in progress.</p>
  </body>
</html>
```

- [ ] **Step 8: Verify the dev server starts**

```bash
npm run dev
```

Expected: Astro dev server starts, page renders at `http://localhost:4321` with "mcnees.me" heading on dark background.

- [ ] **Step 9: Verify production build**

```bash
npm run build
```

Expected: Build succeeds, outputs static files to `dist/`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: replace Next.js with Astro scaffold

Astro with React, Tailwind v4, MDX, and Cloudflare Pages adapter.
Minimal placeholder page to verify setup."
```

---

### Task 2: Base Layout

**Files:**
- Create: `src/layouts/base-layout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create base layout**

Create `src/layouts/base-layout.astro`:

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description = "Engineering manager, builder, writer." } = Astro.props;
const currentPath = Astro.url.pathname;

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.ico" />
    <title>{title}</title>
  </head>
  <body class="min-h-screen flex flex-col">
    <header class="w-full max-w-2xl mx-auto px-6 py-8 flex items-center justify-between">
      <a href="/" class="text-gray-100 text-lg font-semibold no-underline hover:text-white">
        Michael McNees
      </a>
      <nav class="flex gap-6">
        {navLinks.map(({ href, label }) => (
          <a
            href={href}
            class:list={[
              "text-sm no-underline transition-colors",
              currentPath === href || (href !== "/" && currentPath.startsWith(href))
                ? "text-gray-100"
                : "text-gray-500 hover:text-gray-300",
            ]}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>

    <main class="w-full max-w-2xl mx-auto px-6 flex-1">
      <slot />
    </main>

    <footer class="w-full max-w-2xl mx-auto px-6 py-8">
      <p class="text-gray-600 text-xs">
        &copy; {new Date().getFullYear()} Michael McNees
      </p>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Update index page to use layout**

Update `src/pages/index.astro`:

```astro
---
import BaseLayout from "@/layouts/base-layout.astro";
---
<BaseLayout title="Michael McNees">
  <section class="py-16">
    <h1 class="text-4xl font-bold text-gray-100 mb-4">
      Hi, I'm Michael McNees
    </h1>
    <p class="text-lg text-gray-400 leading-relaxed max-w-lg">
      Engineering manager, builder, and writer. I lead engineering teams and tinker with TypeScript, React, Go, and whatever else catches my attention.
    </p>
    <div class="mt-8 flex gap-4 text-sm">
      <a href="mailto:mcnees.michael@gmail.com">Get in touch</a>
      <a href="https://github.com/michaelmcnees" target="_blank" rel="noopener">GitHub</a>
      <a href="https://gitlab.com/mmcnees" target="_blank" rel="noopener">GitLab</a>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify layout renders correctly**

```bash
npm run dev
```

Expected: Page shows nav (Home, Blog, About) at top, intro section centered, footer at bottom. Dark background, light text, sky-blue links.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/base-layout.astro src/pages/index.astro
git commit -m "feat: add base layout with nav and footer"
```

---

## Chunk 2: Content Collections & Blog

### Task 3: Content Collection Schema

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog/hello-world.mdx` (seed post)

- [ ] **Step 1: Define the blog collection schema**

Create `src/content.config.ts`:

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Create a seed blog post**

Create `src/content/blog/hello-world.mdx`:

```mdx
---
title: "Hello World"
description: "First post on the new site."
date: 2026-03-09
tags: ["meta"]
draft: false
---

This is the first post on the rebuilt mcnees.me. The site is now powered by [Astro](https://astro.build), styled with Tailwind CSS, and deployed to Cloudflare Pages.

## Why the rebuild?

The old site was a single-page Next.js app. It worked, but it was overkill for what was essentially a landing page. Astro is a better fit for a content-focused site — it ships zero JavaScript by default and has first-class MDX support.

## What's next

I'll be writing about engineering leadership, technical topics, and whatever else is on my mind.

```javascript
// Here's some code to test syntax highlighting
const site = {
  framework: "Astro",
  styling: "Tailwind CSS v4",
  content: "MDX",
  deploy: "Cloudflare Pages",
};

console.log(`Welcome to ${site.framework}!`);
```
```

- [ ] **Step 3: Verify content collection loads**

```bash
npm run dev
```

Expected: Dev server starts without content collection errors.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/content/blog/hello-world.mdx
git commit -m "feat: add blog content collection with seed post"
```

---

### Task 4: Blog Post Page

**Files:**
- Create: `src/pages/blog/[slug].astro`
- Create: `src/components/post-meta.astro`

- [ ] **Step 1: Create post-meta component**

Create `src/components/post-meta.astro`:

```astro
---
interface Props {
  date: Date;
  tags: string[];
  minutesRead?: number;
  series?: string;
  seriesOrder?: number;
}

const { date, tags, minutesRead, series, seriesOrder } = Astro.props;

const formattedDate = date.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
---
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
  <time datetime={date.toISOString()}>{formattedDate}</time>
  {minutesRead && <span>&middot; {minutesRead} min read</span>}
  {series && (
    <span>
      &middot;
      <a href={`/blog/series/${series}`} class="text-gray-500 hover:text-gray-300 no-underline">
        Part {seriesOrder ?? "?"} of series
      </a>
    </span>
  )}
</div>
{tags.length > 0 && (
  <div class="flex flex-wrap gap-2 mt-2">
    {tags.map((tag) => (
      <span class="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
        {tag}
      </span>
    ))}
  </div>
)}
```

- [ ] **Step 2: Create the blog post page**

Create `src/pages/blog/[slug].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import PostMeta from "@/components/post-meta.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);

// Estimate reading time: ~200 words per minute
const wordCount = post.body?.split(/\s+/).length ?? 0;
const minutesRead = Math.max(1, Math.ceil(wordCount / 200));
---
<BaseLayout title={`${post.data.title} — Michael McNees`} description={post.data.description}>
  <article class="py-12">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-100 mb-3">{post.data.title}</h1>
      <PostMeta
        date={post.data.date}
        tags={post.data.tags}
        minutesRead={minutesRead}
        series={post.data.series}
        seriesOrder={post.data.seriesOrder}
      />
    </header>
    <div class="prose prose-invert">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verify the blog post renders**

```bash
npm run dev
```

Navigate to `http://localhost:4321/blog/hello-world`.

Expected: Post renders with title, date, tags, reading time, and formatted MDX content including syntax-highlighted code block.

- [ ] **Step 4: Commit**

```bash
git add src/components/post-meta.astro src/pages/blog/\[slug\].astro
git commit -m "feat: add blog post page with post-meta component"
```

---

### Task 5: Blog Index Page

**Files:**
- Create: `src/components/post-list.astro`
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: Create post-list component**

Create `src/components/post-list.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  posts: CollectionEntry<"blog">[];
  limit?: number;
}

const { posts, limit } = Astro.props;

const sorted = posts
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, limit);
---
<ul class="space-y-6 list-none p-0">
  {sorted.map((post) => {
    const formattedDate = post.data.date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return (
      <li>
        <a href={`/blog/${post.id}`} class="group block no-underline">
          <h3 class="text-gray-100 font-medium group-hover:text-sky-400 transition-colors">
            {post.data.title}
          </h3>
          <p class="text-sm text-gray-500 mt-1">{post.data.description}</p>
          <span class="text-xs text-gray-600 mt-1 block">{formattedDate}</span>
        </a>
      </li>
    );
  })}
</ul>
```

- [ ] **Step 2: Create blog index page**

Create `src/pages/blog/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import PostList from "@/components/post-list.astro";

const posts = await getCollection("blog", ({ data }) => !data.draft);

// Collect all unique tags
const allTags = [...new Set(posts.flatMap((post) => post.data.tags))].sort();
---
<BaseLayout title="Blog — Michael McNees" description="Writing about engineering leadership, technical topics, and more.">
  <section class="py-12">
    <h1 class="text-3xl font-bold text-gray-100 mb-2">Blog</h1>
    <p class="text-gray-500 mb-8">Writing about leadership, tech, and the things in between.</p>

    <div id="tag-filter" class="mb-8 flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <span class="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded cursor-default">
          {tag}
        </span>
      ))}
    </div>

    <div id="search-container" class="mb-8">
      <!-- Search React island will be mounted here in Task 7 -->
    </div>

    <PostList posts={posts} />
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify blog index renders**

```bash
npm run dev
```

Navigate to `http://localhost:4321/blog`.

Expected: Page shows "Blog" heading, tags listed, and the seed post in a list.

- [ ] **Step 4: Commit**

```bash
git add src/components/post-list.astro src/pages/blog/index.astro
git commit -m "feat: add blog index page with post list"
```

---

### Task 6: Series Support

**Files:**
- Create: `src/components/series-banner.astro`
- Create: `src/pages/blog/series/[series].astro`
- Create: `src/content/blog/series-example-part-1.mdx` (test content)
- Create: `src/content/blog/series-example-part-2.mdx` (test content)

- [ ] **Step 1: Create seed series posts**

Create `src/content/blog/series-example-part-1.mdx`:

```mdx
---
title: "Learning Go: Getting Started"
description: "Setting up a Go development environment and writing your first program."
date: 2026-03-01
tags: ["go", "tutorial"]
series: "learning-go"
seriesOrder: 1
draft: false
---

Part one of my journey learning Go. Setting up the environment, understanding the basics.

## Setting up Go

Install Go, set your GOPATH, and create your first module.
```

Create `src/content/blog/series-example-part-2.mdx`:

```mdx
---
title: "Learning Go: Concurrency Basics"
description: "Understanding goroutines and channels in Go."
date: 2026-03-05
tags: ["go", "tutorial"]
series: "learning-go"
seriesOrder: 2
draft: false
---

Part two covers goroutines and channels — the concurrency primitives that make Go special.

## Goroutines

A goroutine is a lightweight thread managed by the Go runtime.
```

- [ ] **Step 2: Create series-banner component**

Create `src/components/series-banner.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  currentPost: CollectionEntry<"blog">;
  seriesPosts: CollectionEntry<"blog">[];
}

const { currentPost, seriesPosts } = Astro.props;

const sorted = seriesPosts.sort(
  (a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0)
);

const currentIndex = sorted.findIndex((p) => p.id === currentPost.id);
const seriesSlug = currentPost.data.series!;
---
<div class="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
  <p class="text-sm text-gray-400 mb-2">
    Part {currentIndex + 1} of {sorted.length} in
    <a href={`/blog/series/${seriesSlug}`} class="text-sky-400 hover:text-sky-300">
      this series
    </a>
  </p>
  <ol class="list-decimal list-inside text-sm space-y-1 m-0 p-0">
    {sorted.map((post, i) => (
      <li class={i === currentIndex ? "text-gray-100 font-medium" : "text-gray-500"}>
        {i === currentIndex ? (
          post.data.title
        ) : (
          <a href={`/blog/${post.id}`} class="text-gray-500 hover:text-gray-300 no-underline">
            {post.data.title}
          </a>
        )}
      </li>
    ))}
  </ol>
</div>
```

- [ ] **Step 3: Add series-banner to blog post page**

Modify `src/pages/blog/[slug].astro` — add series lookup and banner.

After the existing imports, add:

```astro
import SeriesBanner from "@/components/series-banner.astro";
```

Inside `getStaticPaths`, replace the existing implementation with:

```astro
const allPosts = await getCollection("blog", ({ data }) => !data.draft);
return allPosts.map((post) => {
  const seriesPosts = post.data.series
    ? allPosts.filter((p) => p.data.series === post.data.series)
    : [];
  return {
    params: { slug: post.id },
    props: { post, seriesPosts },
  };
});
```

Update the props destructuring:

```astro
const { post, seriesPosts } = Astro.props;
```

Add the banner in the article, between `</header>` and `<div class="prose">`:

```astro
{post.data.series && seriesPosts.length > 1 && (
  <SeriesBanner currentPost={post} seriesPosts={seriesPosts} />
)}
```

- [ ] **Step 4: Create series landing page**

Create `src/pages/blog/series/[series].astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const seriesSlugs = [...new Set(
    posts.filter((p) => p.data.series).map((p) => p.data.series!)
  )];

  return seriesSlugs.map((series) => ({
    params: { series },
    props: {
      series,
      posts: posts
        .filter((p) => p.data.series === series)
        .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0)),
    },
  }));
}

const { series, posts } = Astro.props;

// Derive a readable title from the slug
const seriesTitle = series.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
---
<BaseLayout title={`${seriesTitle} — Michael McNees`}>
  <section class="py-12">
    <p class="text-sm text-gray-500 mb-1">Series</p>
    <h1 class="text-3xl font-bold text-gray-100 mb-8">{seriesTitle}</h1>

    <ol class="space-y-4 list-none p-0">
      {posts.map((post, i) => (
        <li>
          <a href={`/blog/${post.id}`} class="group block no-underline">
            <span class="text-gray-600 text-sm">Part {i + 1}</span>
            <h3 class="text-gray-100 font-medium group-hover:text-sky-400 transition-colors">
              {post.data.title}
            </h3>
            <p class="text-sm text-gray-500 mt-1">{post.data.description}</p>
          </a>
        </li>
      ))}
    </ol>
  </section>
</BaseLayout>
```

- [ ] **Step 5: Verify series functionality**

```bash
npm run dev
```

- Navigate to `http://localhost:4321/blog/series-example-part-1` — should show series banner with both parts
- Navigate to `http://localhost:4321/blog/series/learning-go` — should show series landing page with both parts in order

- [ ] **Step 6: Commit**

```bash
git add src/components/series-banner.astro src/pages/blog/series/ src/pages/blog/\[slug\].astro src/content/blog/series-example-part-1.mdx src/content/blog/series-example-part-2.mdx
git commit -m "feat: add blog post series support with series banner and landing page"
```

---

## Chunk 3: Search, Homepage, About Page

### Task 7: Pagefind Search

**Files:**
- Create: `src/components/search.tsx`
- Modify: `src/pages/blog/index.astro`
- Modify: `package.json` (add postbuild script)

- [ ] **Step 1: Add Pagefind postbuild script**

In `package.json`, update the `scripts` section to add a postbuild step:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build && npx pagefind --site dist",
  "preview": "astro preview",
  "astro": "astro"
}
```

- [ ] **Step 2: Create search component**

Create `src/components/search.tsx`:

```tsx
import { useState, useEffect, useRef, useCallback } from "react";

interface PagefindResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

interface PagefindResponse {
  results: { data: () => Promise<PagefindResult> }[];
}

interface Pagefind {
  init: () => Promise<void>;
  search: (query: string) => Promise<PagefindResponse>;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pagefindRef = useRef<Pagefind | null>(null);

  useEffect(() => {
    async function loadPagefind() {
      try {
        const pf = await import(/* @vite-ignore */ "/pagefind/pagefind.js");
        await pf.init();
        pagefindRef.current = pf;
      } catch {
        // Pagefind not available in dev mode — expected
      }
    }
    loadPagefind();
  }, []);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (!value.trim() || !pagefindRef.current) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await pagefindRef.current.search(value);
      const data = await Promise.all(
        response.results.slice(0, 8).map((r) => r.data())
      );
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search posts..."
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
      />
      {isLoading && (
        <p className="text-xs text-gray-600 mt-2">Searching...</p>
      )}
      {results.length > 0 && (
        <ul className="mt-3 space-y-3 list-none p-0">
          {results.map((result) => (
            <li key={result.url}>
              <a
                href={result.url}
                className="block no-underline group"
              >
                <h4 className="text-gray-100 text-sm font-medium group-hover:text-sky-400 transition-colors">
                  {result.meta.title}
                </h4>
                <p
                  className="text-xs text-gray-500 mt-0.5 [&_mark]:bg-sky-400/20 [&_mark]:text-sky-300"
                  dangerouslySetInnerHTML={{ __html: result.excerpt }}
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      {query && !isLoading && results.length === 0 && (
        <p className="text-xs text-gray-600 mt-2">No results found.</p>
      )}
    </div>
  );
}
```

Note: `dangerouslySetInnerHTML` is safe here — Pagefind generates excerpt HTML from our own build-time content, not user input.

- [ ] **Step 3: Add search to blog index**

Modify `src/pages/blog/index.astro`. Add the import at the top of the frontmatter:

```astro
import Search from "@/components/search.tsx";
```

Replace the `<!-- Search React island will be mounted here in Task 7 -->` placeholder:

```astro
<Search client:load />
```

- [ ] **Step 4: Verify search builds and works**

```bash
npm run build
npm run preview
```

Navigate to `http://localhost:4321/blog`. Type "Go" into the search box.

Expected: Search returns the Learning Go series posts. (Note: search won't work in `dev` mode — Pagefind index only exists after build.)

- [ ] **Step 5: Commit**

```bash
git add src/components/search.tsx src/pages/blog/index.astro package.json
git commit -m "feat: add Pagefind search to blog index"
```

---

### Task 8: Tag Filtering

**Files:**
- Create: `src/components/tag-filter.tsx`
- Modify: `src/pages/blog/index.astro`

- [ ] **Step 1: Create tag-filter component**

Create `src/components/tag-filter.tsx`:

```tsx
import { useState } from "react";

interface Post {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

interface Props {
  posts: Post[];
  allTags: string[];
}

export default function TagFilter({ posts, allTags }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs px-2 py-0.5 rounded border transition-colors cursor-pointer ${
            !activeTag
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              activeTag === tag
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <ul className="space-y-6 list-none p-0">
        {filtered.map((post) => {
          const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <li key={post.id}>
              <a href={`/blog/${post.id}`} className="group block no-underline">
                <h3 className="text-gray-100 font-medium group-hover:text-sky-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{post.description}</p>
                <span className="text-xs text-gray-600 mt-1 block">{formattedDate}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Update blog index to use tag filter**

Modify `src/pages/blog/index.astro`. Replace the static tag display and `<PostList>` with the interactive `TagFilter`:

Add import:

```astro
import TagFilter from "@/components/tag-filter.tsx";
```

Prepare serialized posts data (add to frontmatter):

```astro
const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
const serializedPosts = sortedPosts.map((p) => ({
  id: p.id,
  title: p.data.title,
  description: p.data.description,
  date: p.data.date.toISOString(),
  tags: p.data.tags,
}));
```

Replace the tag filter `<div>` and `<PostList>` with:

```astro
<TagFilter client:load posts={serializedPosts} allTags={allTags} />
```

The `PostList` import can be removed from this page (it's still used on the homepage).

- [ ] **Step 3: Verify tag filtering works**

```bash
npm run dev
```

Navigate to `http://localhost:4321/blog`. Click tag buttons.

Expected: Clicking a tag filters the post list. Clicking "All" shows everything. Clicking an active tag deselects it.

- [ ] **Step 4: Commit**

```bash
git add src/components/tag-filter.tsx src/pages/blog/index.astro
git commit -m "feat: add interactive tag filtering to blog index"
```

---

### Task 9: Homepage with Latest Posts

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Update homepage with latest posts section**

Update `src/pages/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import PostList from "@/components/post-list.astro";

const posts = await getCollection("blog", ({ data }) => !data.draft);
---
<BaseLayout title="Michael McNees">
  <section class="py-16">
    <h1 class="text-4xl font-bold text-gray-100 mb-4">
      Hi, I'm Michael McNees
    </h1>
    <p class="text-lg text-gray-400 leading-relaxed max-w-lg">
      Engineering manager, builder, and writer. I lead engineering teams and tinker with TypeScript, React, Go, and whatever else catches my attention.
    </p>
    <div class="mt-6 flex gap-4 text-sm">
      <a href="mailto:mcnees.michael@gmail.com">Get in touch</a>
      <a href="https://github.com/michaelmcnees" target="_blank" rel="noopener">GitHub</a>
      <a href="https://gitlab.com/mmcnees" target="_blank" rel="noopener">GitLab</a>
    </div>
  </section>

  <section class="py-8 border-t border-gray-800">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-100">Latest Posts</h2>
      <a href="/blog" class="text-sm text-gray-500 hover:text-gray-300 no-underline">View all &rarr;</a>
    </div>
    <PostList posts={posts} limit={5} />
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify homepage**

```bash
npm run dev
```

Expected: Homepage shows intro section, then a "Latest Posts" section with up to 5 posts.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add latest posts section to homepage"
```

---

### Task 10: About Page

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/components/about-timeline.astro`

- [ ] **Step 1: Create about-timeline component**

Create `src/components/about-timeline.astro`:

```astro
---
interface TimelineEntry {
  period: string;
  role: string;
  description: string;
}

const timeline: TimelineEntry[] = [
  {
    period: "Now",
    role: "Engineering Manager",
    description: "Leading engineering teams, building culture, and bridging the gap between people and technology.",
  },
  {
    period: "Previously",
    role: "Lead Frontend Engineer",
    description: "Led frontend architecture and team across React applications. Grew the team and established patterns.",
  },
  {
    period: "Earlier",
    role: "Frontend Engineer",
    description: "Deep dive into React, TypeScript, and modern frontend tooling. Discovered Tailwind CSS early (v1!) and never looked back.",
  },
  {
    period: "Started",
    role: "Fullstack Engineer",
    description: "Started building web apps with Laravel and PHP. Learned the full stack from databases to deployment.",
  },
];
---
<div class="space-y-8">
  {timeline.map((entry) => (
    <div class="relative pl-6 border-l border-gray-800">
      <div class="absolute -left-1 top-1 w-2 h-2 rounded-full bg-gray-700" />
      <p class="text-xs text-gray-600 mb-1">{entry.period}</p>
      <h3 class="text-gray-100 font-medium">{entry.role}</h3>
      <p class="text-sm text-gray-500 mt-1">{entry.description}</p>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Create about page**

Create `src/pages/about.astro`:

```astro
---
import BaseLayout from "@/layouts/base-layout.astro";
import AboutTimeline from "@/components/about-timeline.astro";
---
<BaseLayout title="About — Michael McNees" description="Engineering manager, builder, and writer.">
  <section class="py-12">
    <h1 class="text-3xl font-bold text-gray-100 mb-6">About</h1>

    <div class="space-y-4 text-gray-400 leading-relaxed mb-12">
      <p>
        I'm an engineering manager who started as a fullstack developer and grew through
        the frontend engineering track. I've been building for the web for over a decade,
        and I still get excited about shipping things.
      </p>
      <p>
        These days I spend most of my time leading people — building teams, setting technical
        direction, and creating environments where engineers do their best work. I've found
        that AI engineering feels surprisingly similar to leading technical teams, and that
        parallel fascinates me.
      </p>
      <p>
        I'm a TypeScript-first developer with a soft spot for Go. I've been using
        Tailwind CSS since v1, and I'll defend utility-first CSS to anyone who'll listen.
      </p>
    </div>

    <h2 class="text-xl font-semibold text-gray-100 mb-6">Career</h2>
    <AboutTimeline />

    <div class="mt-12 pt-8 border-t border-gray-800">
      <h2 class="text-xl font-semibold text-gray-100 mb-4">Get in touch</h2>
      <div class="flex gap-4 text-sm">
        <a href="mailto:mcnees.michael@gmail.com">Email</a>
        <a href="https://github.com/michaelmcnees" target="_blank" rel="noopener">GitHub</a>
        <a href="https://gitlab.com/mmcnees" target="_blank" rel="noopener">GitLab</a>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify about page**

```bash
npm run dev
```

Navigate to `http://localhost:4321/about`.

Expected: About page with bio text, career timeline, and contact links.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/components/about-timeline.astro
git commit -m "feat: add about page with career timeline"
```

---

## Chunk 4: Deployment & Cleanup

### Task 11: Cloudflare Pages Configuration

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Update .gitignore for Astro**

Replace the contents of `.gitignore` with:

```
# Dependencies
node_modules/

# Astro build
dist/

# Environment
.env
.env.*

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Pagefind (generated at build time)
dist/pagefind/

# Superpowers
.superpowers/
```

- [ ] **Step 2: Verify full production build**

```bash
npm run build
```

Expected: Build succeeds. `dist/` contains static HTML files. Pagefind generates search index in `dist/pagefind/`.

- [ ] **Step 3: Verify preview server**

```bash
npm run preview
```

Navigate through all pages. Verify search works in preview mode.

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: update gitignore for Astro and Cloudflare Pages"
```

---

### Task 12: Clean Up Old Assets

**Files:**
- Remove: `public/next.svg`
- Remove: `public/thirteen.svg`
- Remove: `public/vercel.svg`

- [ ] **Step 1: Remove unused Next.js assets**

```bash
rm -f public/next.svg public/thirteen.svg public/vercel.svg
```

- [ ] **Step 2: Verify no broken references**

```bash
npm run build
```

Expected: Build succeeds with no missing asset warnings.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused Next.js assets"
```

---

### Task 13: Final Verification

- [ ] **Step 1: Full build and preview**

```bash
npm run build && npm run preview
```

- [ ] **Step 2: Verify all routes**

Check each page works:
- `http://localhost:4321/` — Homepage with intro and latest posts
- `http://localhost:4321/blog` — Blog index with search and tag filter
- `http://localhost:4321/blog/hello-world` — Single post
- `http://localhost:4321/blog/series-example-part-1` — Post with series banner
- `http://localhost:4321/blog/series/learning-go` — Series landing page
- `http://localhost:4321/about` — About page with timeline

- [ ] **Step 3: Verify search works**

On `/blog`, search for "Go" — should find the series posts.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: final adjustments from verification"
```
