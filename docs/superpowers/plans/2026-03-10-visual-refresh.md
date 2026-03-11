# Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sky-blue accent with Electric Indigo, improve contrast/typography, and add 8 personality-driven design accents.

**Architecture:** Pure visual layer changes — CSS custom properties for the color system, Tailwind utility class updates for contrast, new Astro components for circuit dividers and 404 page, and small JS for the Konami easter egg. No architectural changes.

**Tech Stack:** Astro, Tailwind CSS v4, React (existing interactive components), inline SVG, vanilla JS.

**Spec:** `docs/superpowers/specs/2026-03-10-visual-refresh-design.md`

---

## Chunk 1: Color System & Contrast Foundation

### Task 1: Define Electric Indigo CSS custom properties and replace sky-blue

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add accent color custom properties and replace sky-blue in global.css**

Replace the entire contents of `src/styles/global.css` with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-accent: oklch(0.70 0.20 250);
  --color-accent-hover: oklch(0.80 0.15 245);
  --color-accent-deep: oklch(0.60 0.22 255);
  --color-accent-glow: oklch(0.70 0.20 250 / 0.15);
}

html {
  @apply bg-gray-950 text-gray-300 antialiased;
}

body {
  @apply min-h-screen font-sans;
}

a {
  @apply text-accent hover:text-accent-hover transition-colors;
}

/* Focus states for keyboard navigation */
a:focus-visible,
button:focus-visible {
  @apply outline-2 outline-offset-2 outline-accent/50 rounded-sm;
}

/* Prose color theming for dark background */
.prose {
  @apply text-gray-300 max-w-none text-lg leading-relaxed;
}
.prose h1, .prose h2, .prose h3, .prose h4 {
  @apply text-gray-100 tracking-tight;
}
.prose a {
  @apply text-accent hover:text-accent-hover no-underline;
}
.prose strong {
  @apply text-gray-200;
}
.prose em {
  @apply text-gray-300;
}
.prose code {
  @apply text-gray-300 bg-gray-900 px-1.5 py-0.5 rounded text-sm font-mono;
}
.prose pre {
  @apply bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto;
}
.prose pre code {
  @apply bg-transparent p-0 rounded-none text-sm;
}
.prose blockquote {
  @apply border-l-2 border-gray-700 text-gray-400 pl-4 italic;
}
.prose ul > li::marker, .prose ol > li::marker {
  @apply text-gray-500;
}
.prose hr {
  @apply border-gray-800;
}
.prose img {
  @apply rounded-lg;
}

/* Animations */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes pulse-led {
  0%, 100% { box-shadow: 0 0 6px oklch(0.65 0.18 155 / 0.6), 0 0 12px oklch(0.65 0.18 155 / 0.2); }
  50% { box-shadow: 0 0 4px oklch(0.65 0.18 155 / 0.4), 0 0 8px oklch(0.65 0.18 155 / 0.1); }
}
```

Note: The `@theme` directive in Tailwind v4 registers custom colors so they can be used as `text-accent`, `bg-accent`, etc. Verify this works by checking the Tailwind v4 docs — if `@theme` doesn't support arbitrary color names, fall back to CSS `@property` custom properties and use `text-[--accent]` syntax instead.

- [ ] **Step 2: Start dev server and verify the site builds**

Run: `npm run dev`
Expected: Site compiles without errors. Links should now be Electric Indigo instead of sky-blue.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: replace sky-blue with Electric Indigo color system

Define accent colors as CSS custom properties via @theme.
Bump body text from gray-400 to gray-300 for better contrast.
Bump prose blockquote from gray-500 to gray-400.
Bump list markers from gray-600 to gray-500.
Add heading tracking-tight in prose.
Add blink and pulse-led keyframe animations for later use."
```

---

### Task 2: Update contrast in base layout (header, footer, nav)

**Files:**
- Modify: `src/layouts/base-layout.astro`

- [ ] **Step 1: Update header site title with terminal cursor**

In `base-layout.astro`, change the site title `<a>` (line 36) from:
```html
<a href="/" class="text-gray-100 text-lg font-semibold no-underline hover:text-white">
  Michael McNees
</a>
```
to:
```html
<a href="/" class="text-gray-100 text-lg font-semibold no-underline hover:text-white relative">
  Michael McNees<span class="inline-block w-[0.55em] h-[1.1em] bg-accent align-text-bottom ml-0.5 motion-safe:animate-[blink_1s_step-end_infinite]" aria-hidden="true"></span>
</a>
```

- [ ] **Step 2: Update nav link active state with fretboard dot**

Change the nav link `<a>` (lines 41-53) from:
```html
<a
  href={href}
  class:list={[
    "text-sm no-underline transition-colors",
    currentPath === href || (href !== "/" && currentPath.startsWith(href + "/"))
      ? "text-gray-100"
      : "text-gray-500 hover:text-gray-300",
  ]}
>
  {label}
</a>
```
to:
```html
<a
  href={href}
  class:list={[
    "text-sm no-underline transition-colors relative",
    currentPath === href || (href !== "/" && currentPath.startsWith(href + "/"))
      ? "text-gray-100"
      : "text-gray-400 hover:text-gray-200",
  ]}
>
  {label}
  {(currentPath === href || (href !== "/" && currentPath.startsWith(href + "/"))) && (
    <span class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full" style="background: radial-gradient(circle at 35% 35%, oklch(0.95 0 0 / 0.15), oklch(0.95 0 0 / 0.05));" aria-hidden="true"></span>
  )}
</a>
```

Note: Nav inactive text bumped from `gray-500` to `gray-400`, hover from `gray-300` to `gray-200`.

- [ ] **Step 3: Update footer with power LED**

Change the footer (lines 60-64) from:
```html
<footer class="w-full max-w-2xl mx-auto px-6 py-8">
  <p class="text-gray-600 text-xs">
    &copy; {new Date().getFullYear()} Michael McNees
  </p>
</footer>
```
to:
```html
<footer class="w-full max-w-2xl mx-auto px-6 py-8">
  <p class="text-gray-500 text-sm flex items-center gap-2">
    <span class="inline-block w-1.5 h-1.5 rounded-full motion-safe:animate-[pulse-led_3s_ease-in-out_infinite]" style="background: oklch(0.65 0.18 155); box-shadow: 0 0 6px oklch(0.65 0.18 155 / 0.6), 0 0 12px oklch(0.65 0.18 155 / 0.2);" aria-hidden="true"></span>
    System online &middot; &copy; {new Date().getFullYear()} Michael McNees
  </p>
</footer>
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev` (if not already running)
Check: Terminal cursor blinks on site title, fretboard dot appears under active nav, footer shows green LED with "System online" text.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/base-layout.astro
git commit -m "feat: add terminal cursor, fretboard nav dots, power LED footer

Terminal cursor blinks after site title using accent color.
Active nav links show pearlescent fretboard inlay dot.
Footer upgraded to gray-500/text-sm with pulsing green LED.
All animations respect prefers-reduced-motion."
```

---

### Task 3: Update post-list with accent color and hover translate

**Files:**
- Modify: `src/components/post-list.astro`

- [ ] **Step 1: Update post-list.astro**

Change lines 25-29 from:
```html
<h3 class="text-lg text-gray-100 font-medium group-hover:text-sky-400 transition-colors">
  {post.data.title}
</h3>
<p class="text-sm text-gray-500 mt-1">{post.data.description}</p>
<span class="text-sm text-gray-500 mt-1 block">{formattedDate}</span>
```
to:
```html
<h3 class="text-lg text-gray-100 font-medium group-hover:text-accent transition-colors">
  {post.data.title}
</h3>
<p class="text-sm text-gray-400 mt-1">{post.data.description}</p>
<span class="text-sm text-gray-400 mt-1 block font-mono text-xs">{formattedDate}</span>
```

Also update the `<a>` on line 24 to add hover translate:
```html
<a href={`/blog/${post.id}`} class="group block no-underline transition-transform hover:translate-x-1">
```

- [ ] **Step 2: Verify in browser**

Check homepage and blog index: post titles hover to indigo, descriptions are more readable, dates are monospace, items shift right on hover.

- [ ] **Step 3: Commit**

```bash
git add src/components/post-list.astro
git commit -m "feat: update post list with accent hover, contrast bump, mono dates

Hover color changed from sky-400 to accent.
Description text bumped from gray-500 to gray-400.
Dates styled in monospace.
Added hover:translate-x-1 for interactive feel."
```

---

### Task 4: Update post-meta with commit-hash styling and git-branch icon

**Files:**
- Modify: `src/components/post-meta.astro`

- [ ] **Step 1: Replace post-meta.astro content**

Replace lines 16-29 with:

```html
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
```

- [ ] **Step 2: Verify on a blog post page**

Check: Date appears in a monospace pill with a git-branch icon prefix. Tags are more visible with lighter text and borders.

- [ ] **Step 3: Commit**

```bash
git add src/components/post-meta.astro
git commit -m "feat: commit-hash styled dates with git-branch icon, visible tags

Date displayed in monospace pill with inline SVG git-branch icon.
Reading time in monospace to match.
Tag pills upgraded to bg-gray-800/50 with gray-700 borders for visibility."
```

---

### Task 5: Update search and tag-filter React components

**Files:**
- Modify: `src/components/search.tsx`
- Modify: `src/components/tag-filter.tsx`

- [ ] **Step 1: Update search.tsx accent colors**

In `search.tsx`, make these replacements:

Line 72: Change `focus-visible:ring-sky-400/50` to `focus-visible:ring-accent/50`

Line 85: Change `group-hover:text-sky-400` to `group-hover:text-accent`

Line 89: Change `[&_mark]:bg-sky-400/20 [&_mark]:text-sky-300` to `[&_mark]:bg-accent/20 [&_mark]:text-accent-hover`

Also bump contrast:
Line 89: Change `text-gray-500` to `text-gray-400`

- [ ] **Step 2: Update tag-filter.tsx accent colors and contrast**

In `tag-filter.tsx`, update the inactive tag buttons (line 31 and line 41):

Change inactive state class from:
`"bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"`
to:
`"bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200"`

Change active state class from:
`"bg-gray-800 border-gray-700 text-gray-200"`
to:
`"bg-gray-700 border-gray-600 text-gray-100"`

Update post title hover (line 62): Change `group-hover:text-sky-400` to `group-hover:text-accent`

Bump description text (line 64): Change `text-gray-500` to `text-gray-400`

Bump date text (line 65): Change `text-gray-500` to `text-gray-400`

- [ ] **Step 3: Verify in browser**

Check blog index: search input focus ring is indigo, search result hover is indigo, search highlight marks are indigo. Tag filter buttons are more visible. Post list matches updated styling.

- [ ] **Step 4: Commit**

```bash
git add src/components/search.tsx src/components/tag-filter.tsx
git commit -m "feat: update search and tag filter to accent colors, bump contrast

Replace all sky-400/sky-300 with accent/accent-hover in search.
Tag filter buttons more visible with lighter backgrounds and borders.
Post text contrast bumped from gray-500 to gray-400."
```

---

### Task 6: Update page-level contrast and typography

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/components/about-timeline.astro`

- [ ] **Step 1: Update index.astro**

Line 10 — change h1 classes from:
`"text-4xl font-bold text-gray-100 mb-4"` to `"text-5xl font-bold text-gray-100 mb-4 tracking-tight"`

Line 14 — change paragraph text from `text-gray-400` to `text-gray-300`

Line 17 — change "Get in touch" link area text from `text-sm` to `text-sm text-gray-400` (the `<a>` tags inside will inherit accent color from global styles)

Line 25 — change h2 from `"text-xl font-semibold text-gray-100"` to `"text-xl font-semibold text-gray-100 tracking-tight"`

Line 26 — change "View all" link from `"text-sm text-gray-500 hover:text-gray-300 no-underline"` to `"text-sm text-gray-400 hover:text-gray-200 no-underline"`

- [ ] **Step 2: Update about.astro**

Line 7 — change h1 from `"text-3xl font-bold text-gray-100 mb-6"` to `"text-3xl font-bold text-gray-100 mb-6 tracking-tight"`

Line 33 — change Career h2 from `"text-xl font-semibold text-gray-100 mb-6"` to `"text-xl font-semibold text-gray-100 mb-6 tracking-tight"`

Line 38 — change "Outside of Work" h2 from `"text-xl font-semibold text-gray-100 mb-4"` to `"text-xl font-semibold text-gray-100 mb-4 tracking-tight"`

Line 60 — change "Get in Touch" h2 from `"text-xl font-semibold text-gray-100 mb-4"` to `"text-xl font-semibold text-gray-100 mb-4 tracking-tight"`

- [ ] **Step 3: Update blog/index.astro**

Line 23 — change h1 from `"text-3xl font-bold text-gray-100 mb-2"` to `"text-3xl font-bold text-gray-100 mb-2 tracking-tight"`

Line 24 — change description from `text-gray-500` to `text-gray-400`

- [ ] **Step 4: Update blog/[slug].astro**

Line 23 — change h1 from `"text-3xl font-bold text-gray-100 mb-3"` to `"text-3xl font-bold text-gray-100 mb-3 tracking-tight"`

- [ ] **Step 5: Update about-timeline.astro**

Line 59 — change period text from `"text-xs text-gray-600 mb-1"` to `"text-xs text-gray-500 mb-1 font-mono"`

Line 61 — change description from `"text-sm text-gray-500 mt-1"` to `"text-sm text-gray-400 mt-1"`

- [ ] **Step 6: Verify all pages in browser**

Check: Homepage h1 is larger with tight tracking. All headings have tighter letter spacing. Text across all pages is more legible. Timeline dates are monospace.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro src/pages/about.astro src/pages/blog/index.astro src/pages/blog/\[slug\].astro src/components/about-timeline.astro
git commit -m "feat: typography and contrast improvements across all pages

Home h1 bumped to text-5xl with tracking-tight.
All h1/h2 elements get tracking-tight.
Secondary text bumped from gray-500 to gray-400 site-wide.
Timeline dates styled in monospace.
Timeline descriptions bumped to gray-400."
```

---

## Chunk 2: Signature Elements & Texture

### Task 7: Create circuit trace divider component

**Files:**
- Create: `src/components/circuit-divider.astro`

- [ ] **Step 1: Create the circuit divider component**

Create `src/components/circuit-divider.astro`:

```astro
---
interface Props {
  class?: string;
}

const { class: className = "" } = Astro.props;
---
<div class:list={["py-4 group", className]} role="separator" aria-hidden="true">
  <svg viewBox="0 0 600 16" class="w-full h-4 transition-[filter] duration-300 group-hover:[filter:drop-shadow(0_0_4px_var(--color-accent-glow))]" preserveAspectRatio="none">
    <polyline
      points="0,8 80,8 90,3 180,3 190,8 280,8 285,13 320,13 325,8 450,8 455,3 500,3 510,8 600,8"
      fill="none"
      stroke="oklch(0.30 0.04 250)"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="190" cy="8" r="2.5" fill="oklch(0.30 0.04 250)" />
    <circle cx="325" cy="8" r="2.5" fill="oklch(0.30 0.04 250)" />
    <circle cx="510" cy="8" r="2.5" fill="oklch(0.30 0.04 250)" />
    <line x1="280" y1="8" x2="280" y2="14" stroke="oklch(0.25 0.03 250)" stroke-width="1" stroke-linecap="round" />
  </svg>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/circuit-divider.astro
git commit -m "feat: create circuit trace divider component

PCB-style SVG divider with vias and trace jogs.
Faintly indigo-tinted, glows on hover.
Reusable across pages as section separator."
```

---

### Task 8: Replace border dividers with circuit traces

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Update index.astro**

Add import at top of frontmatter (after line 4):
```js
import CircuitDivider from "@/components/circuit-divider.astro";
```

Replace the `border-t border-gray-800` on the "Latest Posts" section (line 23). Change:
```html
<section class="py-12 border-t border-gray-800">
```
to:
```html
<CircuitDivider />
<section class="py-12">
```

- [ ] **Step 2: Update about.astro**

Add import at top of frontmatter (after line 3):
```js
import CircuitDivider from "@/components/circuit-divider.astro";
```

Replace the two `border-t border-gray-800` dividers:

Line 36 — change:
```html
<div class="mt-12 pt-8 border-t border-gray-800">
```
to:
```html
<CircuitDivider class="mt-12" />
<div class="pt-4">
```

Line 59 — change:
```html
<div class="mt-12 pt-8 border-t border-gray-800">
```
to:
```html
<CircuitDivider class="mt-12" />
<div class="pt-4">
```

- [ ] **Step 3: Verify in browser**

Check: Homepage and about page show PCB traces instead of plain lines. Traces glow faintly on hover.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/about.astro
git commit -m "feat: replace border dividers with circuit traces

Homepage and about page now use CircuitDivider component
instead of plain border-t border-gray-800 lines."
```

---

### Task 9: Create Game Over 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create 404.astro**

Create `src/pages/404.astro`:

```astro
---
import BaseLayout from "@/layouts/base-layout.astro";
import { getCollection } from "astro:content";

const posts = await getCollection("blog", ({ data }) => !data.draft);
const randomPost = posts[Math.floor(Math.random() * posts.length)];
const randomUrl = randomPost ? `/blog/${randomPost.id}` : "/blog";
---
<BaseLayout title="404 — Michael McNees" description="Page not found.">
  <section class="py-24 flex flex-col items-center justify-center text-center">
    <div class="relative">
      <!-- CRT scanline overlay -->
      <div class="absolute inset-0 pointer-events-none" style="background: repeating-linear-gradient(to bottom, transparent 0 2px, oklch(0 0 0 / 0.06) 2px 4px);" aria-hidden="true"></div>

      <h1
        class="text-6xl font-bold font-mono tracking-widest motion-safe:animate-[flicker_4s_infinite]"
        style="color: var(--color-accent); text-shadow: 0 0 12px oklch(0.70 0.20 250 / 0.5), 0 0 24px oklch(0.70 0.20 250 / 0.2);"
      >
        GAME OVER
      </h1>

      <p class="mt-6 text-lg font-mono" style="color: oklch(0.55 0.10 250);">
        CONTINUE?
        <a href="/" class="no-underline font-bold ml-2" style="color: var(--color-accent-hover);">[Y]</a>
        <span class="mx-1">/</span>
        <a href={randomUrl} class="no-underline" style="color: oklch(0.50 0.08 250);">[N]</a>
      </p>

      <p class="mt-8 text-sm text-gray-500 font-mono">
        ERR 404 — STAGE NOT FOUND
      </p>
    </div>
  </section>

  <style>
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      92% { opacity: 1; }
      93% { opacity: 0.97; }
      94% { opacity: 1; }
      96% { opacity: 0.98; }
      97% { opacity: 1; }
    }
  </style>
</BaseLayout>
```

- [ ] **Step 2: Verify by visiting a non-existent URL**

Run: `npm run dev` then visit `http://localhost:4321/nonexistent`
Check: "GAME OVER" in large monospace with phosphor glow, CRT scanlines, Y links to home, N links to random post.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add Game Over 404 page

CRT-styled 404 with phosphor glow, scanline overlay, and
CONTINUE? [Y/N] prompt. Y goes home, N goes to a random post.
Subtle flicker animation respects prefers-reduced-motion."
```

---

### Task 10: Add isometric grid background

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add isometric grid to global.css**

Add after the `body` rule (after `@apply min-h-screen font-sans;`):

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      30deg,
      oklch(0.14 0.01 250) 0px,
      oklch(0.14 0.01 250) 1px,
      transparent 1px,
      transparent 40px
    ),
    repeating-linear-gradient(
      150deg,
      oklch(0.14 0.01 250) 0px,
      oklch(0.14 0.01 250) 1px,
      transparent 1px,
      transparent 40px
    );
}
```

- [ ] **Step 2: Verify in browser**

Check: A very faint isometric grid is barely visible on the dark background. It should add texture without competing with content. If too visible, reduce opacity or make the color closer to the background.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add dark-on-dark isometric grid background

Barely-perceptible isometric grid via repeating-linear-gradient.
Evokes retro game perspectives and technical drawing.
Fixed position, pointer-events none, z-index -1."
```

---

### Task 11: Add Konami code easter egg

**Files:**
- Modify: `src/layouts/base-layout.astro`

- [ ] **Step 1: Add Konami code script to base-layout.astro**

Add just before the closing `</body>` tag in `base-layout.astro`:

```html
<script>
  if (typeof window !== "undefined") {
    requestIdleCallback(() => {
      const code = [38,38,40,40,37,39,37,39,66,65];
      let pos = 0;
      document.addEventListener("keydown", (e) => {
        if (e.keyCode === code[pos]) {
          pos++;
          if (pos === code.length) {
            pos = 0;
            // Scanline flash
            const overlay = document.createElement("div");
            Object.assign(overlay.style, {
              position: "fixed", inset: "0", zIndex: "9999",
              pointerEvents: "none", opacity: "0",
              background: "repeating-linear-gradient(to bottom, transparent 0 2px, oklch(0 0 0 / 0.08) 2px 4px)"
            });
            document.body.appendChild(overlay);
            overlay.animate([
              { opacity: 0 }, { opacity: 0.15, offset: 0.3 }, { opacity: 0 }
            ], { duration: 2000 }).onfinish = () => overlay.remove();
            // Toast
            const toast = document.createElement("div");
            toast.textContent = "30 extra lives granted";
            Object.assign(toast.style, {
              position: "fixed", bottom: "2rem", left: "50%",
              transform: "translateX(-50%) translateY(1rem)",
              fontFamily: "ui-monospace, monospace", fontSize: "0.875rem",
              color: "var(--color-accent)", padding: "0.5rem 1rem",
              border: "1px solid var(--color-accent)",
              borderRadius: "0.5rem", background: "oklch(0.13 0.02 261)",
              zIndex: "10000", opacity: "0", whiteSpace: "nowrap"
            });
            document.body.appendChild(toast);
            toast.animate([
              { opacity: 0, transform: "translateX(-50%) translateY(1rem)" },
              { opacity: 1, transform: "translateX(-50%) translateY(0)", offset: 0.15 },
              { opacity: 1, transform: "translateX(-50%) translateY(0)", offset: 0.7 },
              { opacity: 0, transform: "translateX(-50%) translateY(-0.5rem)" }
            ], { duration: 3000 }).onfinish = () => toast.remove();
          }
        } else {
          pos = e.keyCode === code[0] ? 1 : 0;
        }
      });
    });
  }
</script>
```

- [ ] **Step 2: Verify the easter egg**

In the browser, type the Konami code: Up Up Down Down Left Right Left Right B A
Check: Scanline flash overlay appears briefly, toast message "30 extra lives granted" slides up and fades out.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/base-layout.astro
git commit -m "feat: add Konami code easter egg

Up Up Down Down Left Right Left Right B A triggers CRT scanline
flash and '30 extra lives granted' toast. Loaded via requestIdleCallback
for zero render impact. ~800 bytes of vanilla JS."
```

---

### Task 12: Final verification pass

- [ ] **Step 1: Full site walkthrough**

Visit every page and verify:
1. Homepage — Electric Indigo links, large h1, circuit divider, post list with hover translate
2. Blog index — search works with indigo highlights, tag filters visible, posts styled correctly
3. Blog post — commit-hash date with git icon, visible tags, prose uses correct accent
4. About — circuit dividers, timeline with monospace dates, contrast bumps applied
5. 404 — Game Over page works at any invalid URL
6. Header — terminal cursor blinks, fretboard dot on active page
7. Footer — green LED pulses, "System online" text visible
8. Background — faint isometric grid visible on close inspection
9. Konami code — easter egg triggers correctly
10. Reduced motion — disable animations in OS settings, verify no animations play

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Build completes with no errors or warnings.

- [ ] **Step 3: Final commit if any fixes needed**

If any adjustments were needed during verification, commit them with a descriptive message.
