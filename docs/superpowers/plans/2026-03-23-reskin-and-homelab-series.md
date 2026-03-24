# Site Reskin + Homelab Blog Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin mcnees.me with the mantle design system (electric blue accent) and create the first post in the "Upgrading the Homelab" blog series.

**Architecture:** The reskin touches CSS theme variables, Google Font loading, and component-level Tailwind classes. No structural changes to Astro pages or build pipeline. The blog post is a new MDX file using existing content infrastructure. A shared `hashToHue` utility enables deterministic tag coloring across Astro and React components.

**Tech Stack:** Astro 5, Tailwind CSS v4, React 19, MDX, Google Fonts

**Spec:** `docs/superpowers/specs/2026-03-23-reskin-and-homelab-series-design.md`

---

## File Map

**Create:**
- `src/utils/tag-color.ts` — shared `hashToHue` utility
- `src/content/blog/upgrading-the-homelab-part-1.mdx` — Part 1 blog post
- `src/content/blog/upgrading-the-homelab-part-2.mdx` — Part 2 placeholder (draft)

**Modify:**
- `src/styles/global.css` — color system, font families, prose theming, background pattern
- `src/layouts/base-layout.astro` — Google Font links, nav active indicator, Konami code colors
- `src/pages/index.astro` — remove CircuitDivider import/usage, update Tailwind classes
- `src/pages/about.astro` — remove CircuitDivider imports/usage
- `src/pages/404.astro` — update accent color references
- `src/pages/blog/index.astro` — update heading classes
- `src/pages/blog/[slug].astro` — update heading classes
- `src/components/post-meta.astro` — integrate tag badge styling with hue hash
- `src/components/post-list.astro` — update text color classes
- `src/components/tag-filter.tsx` — update button styles, integrate tag badge styling
- `src/components/search.tsx` — update input/result color classes
- `src/components/about-timeline.astro` — update border/dot colors

**Delete:**
- `src/components/circuit-divider.astro`

---

### Task 1: Create shared tag color utility

**Files:**
- Create: `src/utils/tag-color.ts`

- [ ] **Step 1: Create the utility file**

```ts
// src/utils/tag-color.ts
export function hashToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash) % 360;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/tag-color.ts
git commit -m "feat: add deterministic tag-to-hue hash utility"
```

---

### Task 2: Replace color system and typography in global.css

**Files:**
- Modify: `src/styles/global.css`

This is the foundation — every subsequent task depends on these theme tokens being in place.

- [ ] **Step 1: Replace the `@theme` block**

Replace the existing `@theme` block (lines 4-8) with mantle surface + electric blue accent tokens:

```css
@theme {
  /* Surfaces */
  --color-surface: #0e0e0e;
  --color-surface-container-lowest: #000000;
  --color-surface-container-low: #131313;
  --color-surface-container: #1a1919;
  --color-surface-container-high: #201f1f;
  --color-surface-container-highest: #262626;
  --color-surface-variant: #262626;

  /* Accent — electric blue */
  --color-primary: #a4d4ff;
  --color-primary-dim: #00b4ff;
  --color-secondary: #72d4fb;
  --color-tertiary: #7ee6ff;

  /* Text */
  --color-on-surface: #ffffff;
  --color-on-surface-variant: #adaaaa;
  --color-outline: #777575;
  --color-outline-variant: #494847;

  /* Error */
  --color-error: #ff716c;

  /* Legacy aliases (for Tailwind classes using 'accent') */
  --color-accent: #a4d4ff;
  --color-accent-hover: #00b4ff;
  --color-accent-glow: oklch(0.70 0.15 230 / 0.15);

  /* Fonts */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  --font-heading: "Space Grotesk", system-ui, sans-serif;
}
```

- [ ] **Step 2: Update the html base styles**

Replace:
```css
html {
  @apply bg-gray-950 text-gray-300 antialiased;
}
```

With:
```css
html {
  background-color: var(--color-surface);
  color: var(--color-on-surface-variant);
  @apply antialiased;
}
```

- [ ] **Step 3: Update the background pattern hue**

In the `body::before` rule, change the oklch hue from `250` to `220` (closer to the electric blue):

Replace both instances of `oklch(0.14 0.01 250)` with `oklch(0.14 0.01 220)`.

- [ ] **Step 4: Update prose theming**

Replace the prose rules with colors from the new system:

```css
.prose {
  color: var(--color-on-surface-variant);
  @apply max-w-none text-lg leading-relaxed;
}
.prose h1, .prose h2, .prose h3, .prose h4 {
  color: var(--color-on-surface);
  @apply tracking-tight;
}
.prose a {
  color: var(--color-primary);
  @apply no-underline;
}
.prose a:hover {
  color: var(--color-primary-dim);
}
.prose strong {
  color: var(--color-on-surface);
}
.prose em {
  color: var(--color-on-surface-variant);
}
.prose code {
  color: var(--color-on-surface-variant);
  background: var(--color-surface-container-low);
  @apply px-1.5 py-0.5 rounded text-sm font-mono;
}
.prose pre {
  background: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
  @apply rounded-lg p-4 overflow-x-auto;
}
.prose pre code {
  @apply bg-transparent p-0 rounded-none text-sm;
}
.prose blockquote {
  border-left: 2px solid var(--color-outline-variant);
  color: var(--color-outline);
  @apply pl-4 italic;
}
.prose ul > li::marker, .prose ol > li::marker {
  color: var(--color-outline);
}
.prose hr {
  border-color: var(--color-outline-variant);
}
.prose img {
  @apply rounded-lg;
}
```

- [ ] **Step 5: Verify the site builds**

Run: `npm run build` (or `npx astro build`)
Expected: Builds without errors.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: replace color system and typography with mantle design tokens"
```

---

### Task 3: Add Google Fonts and update layout

**Files:**
- Modify: `src/layouts/base-layout.astro`

- [ ] **Step 1: Add Google Fonts preconnect and stylesheet links**

Add after the `<meta name="twitter:description" ...>` tag, before the `<link rel="canonical" ...>` line:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Update header logo styling**

Replace the logo `<a>` tag classes:

Old:
```
class="text-gray-100 text-lg font-semibold no-underline hover:text-white relative"
```

New:
```
class="text-on-surface text-lg font-semibold no-underline hover:text-white relative" style="font-family: var(--font-heading);"
```

- [ ] **Step 3: Replace guitar-dot active indicator with blue underline**

Replace the nav link rendering (the entire `{navLinks.map(...)}` block) with:

```astro
{navLinks.map(({ href, label }) => (
  <a
    href={href}
    class:list={[
      "text-sm no-underline transition-colors pb-1",
      currentPath === href || (href !== "/" && currentPath.startsWith(href + "/"))
        ? "text-primary border-b-2 border-primary"
        : "text-on-surface-variant hover:text-on-surface border-b-2 border-transparent",
    ]}
  >
    {label}
  </a>
))}
```

- [ ] **Step 4: Update footer text color**

Replace:
```html
<p class="text-gray-500 text-sm flex items-center gap-2">
```

With:
```html
<p class="text-outline text-sm flex items-center gap-2">
```

- [ ] **Step 5: Update Konami code toast colors**

In the Konami code script, update the toast background color:

Replace `background: "oklch(0.13 0.02 261)"` with `background: "var(--color-surface-container-low)"`.

The toast already uses `var(--color-accent)` for text and border, which now resolves to electric blue.

- [ ] **Step 6: Verify locally**

Run: `npm run dev`
Check: Homepage loads with new fonts, blue underline on active nav, no guitar dots.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/base-layout.astro
git commit -m "feat: add Google Fonts, replace nav indicator with blue underline"
```

---

### Task 4: Remove circuit divider and update index + about pages

**Files:**
- Delete: `src/components/circuit-divider.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Update index.astro**

Remove the `CircuitDivider` import and usage. Replace the full file content with:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import PostList from "@/components/post-list.astro";

const posts = await getCollection("blog", ({ data }) => !data.draft);
---
<BaseLayout title="Michael McNees">
  <section class="py-16">
    <h1 class="text-5xl font-bold text-on-surface mb-4 tracking-tight" style="font-family: var(--font-heading);">
      Hi, I'm Michael McNees 🕹️
    </h1>
    <p class="text-lg text-on-surface-variant leading-relaxed max-w-lg">
      Engineering manager, builder, and writer. I lead engineering teams and tinker with TypeScript, React, Go, and whatever else catches my attention.
    </p>
    <div class="mt-6 flex gap-4 text-sm">
      <a href="mailto:mcnees.michael@gmail.com">Get in touch</a>
      <a href="https://github.com/michaelmcnees" target="_blank" rel="noopener">GitHub</a>
      <a href="https://gitlab.com/mmcnees" target="_blank" rel="noopener">GitLab</a>
    </div>
  </section>

  <section class="py-12">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-on-surface tracking-tight">Latest Posts</h2>
      <a href="/blog" class="text-sm text-on-surface-variant hover:text-on-surface no-underline">View all &rarr;</a>
    </div>
    <PostList posts={posts} limit={5} />
  </section>
</BaseLayout>
```

- [ ] **Step 2: Update about.astro**

Remove both `CircuitDivider` import and usages. Replace `<CircuitDivider class="mt-12" />` with `<hr class="mt-12 border-outline-variant" />` in both places. Update heading and text colors from `text-gray-*` to design token equivalents:

- `text-gray-100` → `text-on-surface`
- `text-gray-400` → `text-on-surface-variant`

Remove the CircuitDivider import line.

- [ ] **Step 3: Delete circuit-divider.astro**

```bash
rm src/components/circuit-divider.astro
```

- [ ] **Step 4: Verify the site builds**

Run: `npx astro build`
Expected: No errors about missing CircuitDivider component.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove circuit divider, update index and about page colors"
```

---

### Task 5: Update post-meta with deterministic tag colors

**Files:**
- Modify: `src/components/post-meta.astro`

- [ ] **Step 1: Replace post-meta.astro content**

```astro
---
import { hashToHue } from "@/utils/tag-color";

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
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
  <span class="inline-flex items-center gap-1 font-mono text-xs rounded px-2 py-0.5" style={`background: var(--color-surface-container-high); color: var(--color-outline);`}>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="shrink-0" aria-hidden="true">
      <circle cx="4" cy="3.5" r="1.5" fill="currentColor"/>
      <circle cx="4" cy="10.5" r="1.5" fill="currentColor"/>
      <circle cx="10" cy="3.5" r="1.5" fill="currentColor"/>
      <line x1="4" y1="5" x2="4" y2="9" stroke="currentColor" stroke-width="1.2"/>
      <path d="M4 5 Q4 3.5 5.5 3.5 L8.5 3.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
    </svg>
    <time datetime={date.toISOString()}>{formattedDate}</time>
  </span>
  {slug && <span id="view-count" class="font-mono text-xs hidden" style={`color: var(--color-outline);`} data-views={slug}>&middot; <span data-views-number></span></span>}
  {minutesRead && <span class="font-mono text-xs" style={`color: var(--color-outline);`}>&middot; {minutesRead} min read</span>}
</div>
{tags.length > 0 && (
  <div class="flex flex-wrap gap-2 mt-2">
    {tags.map((tag) => {
      const hue = hashToHue(tag);
      return (
        <a
          href="/blog"
          class="text-xs font-mono text-on-surface-variant px-2 py-0.5 rounded-sm no-underline hover:text-on-surface transition-colors"
          style={`background: var(--color-surface-container-high); border-left: 3px solid oklch(0.72 0.15 ${hue}); box-shadow: 0 1px 2px rgba(0,0,0,0.4);`}
        >
          {tag}
        </a>
      );
    })}
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

- [ ] **Step 2: Verify locally**

Run: `npm run dev`
Check: Visit a blog post. Tags should have colored left borders and elevated background.

- [ ] **Step 3: Commit**

```bash
git add src/components/post-meta.astro
git commit -m "feat: add deterministic tag colors with hue-hash left border"
```

---

### Task 6: Update tag-filter.tsx with new styling

**Files:**
- Modify: `src/components/tag-filter.tsx`

- [ ] **Step 1: Update the component**

Add `hashToHue` import and update all class strings:

```tsx
import { useState } from "react";
import { hashToHue } from "@/utils/tag-color";

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
          className={`text-xs font-mono px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
            !activeTag
              ? "text-[var(--color-on-surface)] border-l-[3px] border-l-[var(--color-primary)]"
              : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
          }`}
          style={{
            background: "var(--color-surface-container-high)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
            ...(!activeTag ? {} : { borderLeft: "3px solid transparent" }),
          }}
        >
          All
        </button>
        {allTags.map((tag) => {
          const hue = hashToHue(tag);
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs font-mono px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
                isActive
                  ? "text-[var(--color-on-surface)]"
                  : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
              }`}
              style={{
                background: "var(--color-surface-container-high)",
                borderLeft: `3px solid oklch(0.72 0.15 ${hue})`,
                boxShadow: isActive
                  ? `0 1px 2px rgba(0,0,0,0.4), 0 0 8px oklch(0.72 0.15 ${hue} / 0.3)`
                  : "0 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              {tag}
            </button>
          );
        })}
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
                <h3 className="text-lg text-[var(--color-on-surface)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">{post.description}</p>
                <span className="text-[var(--color-on-surface-variant)] mt-1 block font-mono text-xs">{formattedDate}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Verify locally**

Run: `npm run dev`
Check: Visit /blog. Tag filter buttons should have colored left borders. Active tag should glow.

- [ ] **Step 3: Commit**

```bash
git add src/components/tag-filter.tsx
git commit -m "feat: update tag filter with deterministic hue colors and mantle styling"
```

---

### Task 7: Update search component

**Files:**
- Modify: `src/components/search.tsx`

- [ ] **Step 1: Update color classes**

Replace the gray-* classes with design tokens:

- Input: `bg-gray-900` → `bg-[var(--color-surface-container-low)]`, `border-gray-800` → `border-[var(--color-outline-variant)]`, `text-gray-300` → `text-[var(--color-on-surface-variant)]`, `placeholder-gray-600` → `placeholder-[var(--color-outline)]`, `focus:border-gray-700` → `focus:border-[var(--color-outline)]`
- Loading text: `text-gray-600` → `text-[var(--color-outline)]`
- Result hover: `hover:bg-gray-900` → `hover:bg-[var(--color-surface-container-low)]`
- Result title: `text-gray-200` → `text-[var(--color-on-surface)]`
- Result excerpt: `text-gray-400` → `text-[var(--color-on-surface-variant)]`
- No results: `text-gray-600` → `text-[var(--color-outline)]`

- [ ] **Step 2: Verify locally**

Run: `npm run dev`
Check: Search input on /blog uses new colors, focus ring is blue.

- [ ] **Step 3: Commit**

```bash
git add src/components/search.tsx
git commit -m "feat: update search component colors to mantle design tokens"
```

---

### Task 8: Update remaining components and pages

**Files:**
- Modify: `src/components/post-list.astro`
- Modify: `src/components/about-timeline.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Update post-list.astro**

Replace color classes:
- `text-gray-100` → `text-on-surface`
- `group-hover:text-accent` stays (accent alias maps to primary)
- `text-gray-400` → `text-on-surface-variant`

- [ ] **Step 2: Update about-timeline.astro**

Replace color classes:
- `border-gray-800` → `border-outline-variant`
- `bg-gray-700` → `bg-outline`
- `text-gray-500` → `text-outline`
- `text-gray-100` → `text-on-surface`
- `text-gray-400` → `text-on-surface-variant`

- [ ] **Step 3: Update 404.astro**

Update the inline oklch references from hue `250` to `220`:
- `oklch(0.70 0.20 250 / 0.5)` → `oklch(0.70 0.15 220 / 0.5)` (text-shadow)
- `oklch(0.70 0.20 250 / 0.2)` → `oklch(0.70 0.15 220 / 0.2)` (text-shadow)
- `oklch(0.55 0.10 250)` → `oklch(0.55 0.10 220)` (CONTINUE text)
- `oklch(0.50 0.08 250)` → `oklch(0.50 0.08 220)` ([N] link)

The `var(--color-accent)` and `var(--color-accent-hover)` references will automatically pick up the new values.

- [ ] **Step 4: Update blog/index.astro**

Replace:
- `text-gray-100` → `text-on-surface`
- `text-gray-400` → `text-on-surface-variant`

- [ ] **Step 5: Update blog/[slug].astro**

Replace:
- `text-gray-100` → `text-on-surface`

- [ ] **Step 6: Full build verification**

Run: `npx astro build`
Expected: Clean build, no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: update all remaining components and pages to mantle design tokens"
```

---

### Task 9: Write homelab blog post (Part 1)

**Files:**
- Create: `src/content/blog/upgrading-the-homelab-part-1.mdx`

This task uses subagents for content creation:

- [ ] **Step 1: Dispatch Technical Writer subagent**

The Technical Writer subagent should explore `~/Development/homelab` to gather:
- Current hardware inventory (Dell 3050 Micro specs)
- New build specs (AMD 8700G nodes)
- Power consumption comparisons
- Current workloads and services running
- Traefik configuration details (47 routers)
- K8s migration plans
- Marvin/OpenClaw details

Output: a structured technical brief with all facts and figures.

- [ ] **Step 2: Dispatch co-author subagent**

Provide the co-author subagent with:
- The technical brief from Step 1
- The narrative structure from the spec (Act 1/2/3)
- Tone guidance: narrative-first, accessible, humor welcome
- The frontmatter template from the spec
- Target length: ~1500-2000 words

Output: complete MDX file content.

- [ ] **Step 3: Create the MDX file**

Write the co-author's output to `src/content/blog/upgrading-the-homelab-part-1.mdx`.

- [ ] **Step 4: Create Part 2 placeholder**

```mdx
---
title: "Upgrading the Homelab, Part 2: The Build"
description: "From boxes to blinking lights — assembling, installing, and bootstrapping the new cluster."
date: 2026-03-24
tags: [homelab, hardware]
series: upgrading-the-homelab
seriesOrder: 2
draft: true
---

Coming soon.
```

- [ ] **Step 5: Verify the posts appear**

Run: `npm run dev`
Check: Part 1 appears in blog listing. Part 2 does not (draft: true).

- [ ] **Step 6: Commit**

```bash
git add src/content/blog/upgrading-the-homelab-part-1.mdx src/content/blog/upgrading-the-homelab-part-2.mdx
git commit -m "feat: add homelab upgrade blog series — Part 1 and Part 2 placeholder"
```

---

### Task 10: Final verification

- [ ] **Step 1: Full build**

Run: `npx astro build`
Expected: Clean build with no warnings about missing imports or broken references.

- [ ] **Step 2: Visual spot-check**

Run: `npm run dev` and verify:
- Homepage: Space Grotesk heading, Inter body, no circuit divider, electric blue links
- Nav: blue underline on active tab, no guitar dots
- Blog listing: tag filter buttons have colored left borders, search input uses new colors
- Blog post: tags have deterministic left-border colors, date badge uses surface-container-high
- About page: no circuit dividers, hr separators instead, timeline uses new colors
- 404: GAME OVER text glows electric blue
- Konami code: toast uses new accent color

- [ ] **Step 3: Commit any fixups**

If any visual issues are found, fix and commit with descriptive message.
