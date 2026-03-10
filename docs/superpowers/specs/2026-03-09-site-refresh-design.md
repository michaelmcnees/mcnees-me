# mcnees.me Site Refresh — Design Spec

## Overview

Rebuild mcnees.me as a personal brand site with blog support. The site serves as a professional identity page with thought leadership content covering engineering leadership, technical topics, and occasional personal/political posts.

## Tech Stack

- **Astro** (latest) — static site framework with MDX and React island support
- **React** — for interactive components (search, etc.)
- **Tailwind CSS v4** — styling
- **Shiki** — code syntax highlighting (built into Astro)
- **Pagefind** — static client-side search, indexes at build time
- **Astro Content Collections** — type-safe MDX content management
- **Cloudflare Pages** — deployment target via `@astrojs/cloudflare` adapter

## File Naming Convention

- **All file names**: kebab-case (e.g., `post-list.tsx`, `series-banner.astro`)
- **Function/component names**: PascalCase per React convention
- **Content files**: kebab-case slugs (e.g., `why-ai-engineering-feels-like-leading.mdx`)

## Pages & Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `src/pages/index.astro` | Landing — intro, latest 5 posts, quick links |
| `/blog` | `src/pages/blog/index.astro` | Blog index with search and tag filtering |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` | Individual blog post |
| `/blog/series/[series]` | `src/pages/blog/series/[series].astro` | Series landing page — all posts in order |
| `/about` | `src/pages/about.astro` | About page with career timeline |

## Content Structure

```
src/content/blog/
├── why-ai-engineering-feels-like-leading.mdx
├── tailwind-from-v1-to-v4.mdx
└── ...
```

### Frontmatter Schema

```yaml
title: "Why AI Engineering Feels Like Leading Teams"
description: "A reflection on the parallels..."
date: 2026-03-09
tags: ["leadership", "ai"]
series: "ai-and-management"  # optional — matches across posts by slug
seriesOrder: 1               # optional — position within series
draft: false
```

Series are implicit — posts sharing the same `series` slug are grouped together. No separate series config needed.

## Search

**Pagefind** — generates a static search index at build time. Ships a small JS/WASM bundle. No server infrastructure required. Works well with Astro and Cloudflare Pages.

Loaded as a React island only on `/blog`.

## Design System — Minimal Dark

### Colors
- **Background:** near-black (`gray-950`)
- **Primary text:** `gray-100` (headings), `gray-400` (body)
- **Accent:** sky/blue for links and tags
- **Borders/dividers:** `gray-800` sparingly

### Typography
- System sans-serif stack for body
- Monospace for code blocks
- No serif fonts

### Layout
- Single column, max-width ~680px for content
- Generous whitespace
- Minimal top nav: name/logo left, page links right
- Simple footer with copyright

### Principles
- No hero images, gradients, or decorative cards
- Content-first — text and space
- Muted, developer-focused aesthetic

## Components

| Component | File | Type | Purpose |
|---|---|---|---|
| Layout | `src/layouts/base-layout.astro` | Astro | Shared nav + footer shell |
| PostList | `src/components/post-list.astro` | Astro | Renders list of posts (home: 5 recent, blog: all) |
| PostMeta | `src/components/post-meta.astro` | Astro | Date, tags, read time, series link |
| SeriesBanner | `src/components/series-banner.astro` | Astro | Shows series position + links on series posts |
| Search | `src/components/search.tsx` | React | Pagefind search UI, loaded on `/blog` |
| TagFilter | `src/components/tag-filter.tsx` | React | Filter posts by tag on blog index |
| AboutTimeline | `src/components/about-timeline.astro` | Astro | Career timeline on about page |

## Deployment

- **Platform:** Cloudflare Pages
- **Adapter:** `@astrojs/cloudflare`
- **Build:** `astro build` with Pagefind indexing as post-build step
- **No SSR required** — fully static output

## Future (Not in Scope)

- RSS feed
- Newsletter signup
- Comments (Giscus, etc.)
- Analytics (Plausible, etc.)
