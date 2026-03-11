# mcnees.me Visual Refresh — Design Spec

## Overview

Refresh the visual identity of mcnees.me to replace the generic sky-blue accent with Electric Indigo, improve text contrast and typography confidence, and add 8 personality-driven design accents reflecting Michael's interests (retro gaming, bass guitar, coding, homelab).

No changes to layout, architecture, content, or functionality.

## Color System — Electric Indigo

Replace all `sky-400`/`sky-300` usage with a custom Electric Indigo palette defined as CSS custom properties in `global.css`:

```
--accent: oklch(0.70 0.20 250);
--accent-hover: oklch(0.80 0.15 245);
--accent-deep: oklch(0.60 0.22 255);
--accent-glow: oklch(0.70 0.20 250 / 0.15);
```

Apply across: links, hover states, focus rings, search highlights, prose link styles.

## Contrast & Typography

| Element | Before | After |
|---------|--------|-------|
| Body text | gray-400 | gray-300 |
| Secondary text (descriptions, dates) | gray-500 | gray-400 |
| Footer text | gray-600 text-xs | gray-500 text-sm |
| Home h1 | text-4xl | text-5xl tracking-tight |
| All h1/h2 | tracking-normal | tracking-tight leading-tight |
| Dividers | border-gray-800 | Circuit trace SVGs |
| Tag pills | bg-gray-900 border-gray-800 | bg-gray-800/50 border-gray-700 text-gray-300 |
| Post metadata | System font | Monospace with git-branch icon |
| Post list hover | Color shift only | Add hover:translate-x-1 transition |

## Personality Accents

### Phase 1 — Quick Wins

**Terminal Cursor on Site Title**
- `::after` pseudo-element on the site name in the header
- Blinking block cursor in accent color
- `animation: blink 1s step-end infinite` for hard blink
- Wrap in `@media (prefers-reduced-motion: no-preference)`

**Power LED Footer Indicator**
- 6px glowing circle next to footer text
- Green (`oklch(0.65 0.18 155)`) for hardware LED feel
- Gentle pulse animation on box-shadow
- Footer text updated to something like "System online" or similar dry status message
- Respect `prefers-reduced-motion`

**Commit-Hash Styled Post Dates**
- Dates in monospace font with subtle pill background
- `font-family: ui-monospace, monospace; background: oklch(0.15 0.01 250); padding: 2px 8px; border-radius: 4px`
- Prefix with tiny inline SVG git-branch icon (14x14, currentColor)
- Apply to post-meta component (date + reading time)

### Phase 2 — Signature Elements

**Circuit Trace Section Dividers**
- Create a reusable Astro component (`CircuitDivider.astro`)
- Inline SVG: polyline with right-angle jogs, 2-3 via dots, one branch
- Stroke color: `oklch(0.30 0.04 250)` — faintly indigo-tinted
- Hover effect: `filter: drop-shadow(0 0 4px var(--accent-glow))` — trace "powers on"
- Replace `<hr>` / `border-t border-gray-800` usage on homepage, about page, blog index

**Fretboard Dot Nav Indicators**
- `::after` pseudo-element on active nav links in base-layout
- 7px circle with pearlescent radial gradient
- `background: radial-gradient(circle at 35% 35%, oklch(0.95 0 0 / 0.12), oklch(0.95 0 0 / 0.04))`
- Centered below nav text with 4px gap
- Replace current active state styling (text-gray-100)

**"GAME OVER" 404 Page**
- Create `src/pages/404.astro`
- "GAME OVER" in large monospace, accent color, with phosphor text-shadow
- CRT scanline overlay via `::before` with repeating-linear-gradient
- "CONTINUE? [Y/N]" — Y links to /, N links to a random blog post
- Subtle flicker animation (opacity 0.97-1.0), respects prefers-reduced-motion
- Random post selection: can use `getCollection('blog')` at build time and pick randomly, or hardcode a few

### Phase 3 — Texture & Discovery

**Dark-on-Dark Isometric Grid Background**
- Applied to `body::before` as fixed-position full-bleed layer
- Two overlapping `repeating-linear-gradient` at 30deg and 150deg
- Line color: `oklch(0.14 0.01 250)` — barely perceptible
- Grid cell size ~40px
- `pointer-events: none; z-index: 0`

**Konami Code Easter Egg**
- Vanilla JS listener tracking last 10 keystrokes
- On match: inject full-viewport scanline overlay, animate opacity 0→0.15→0 over 2s
- Toast notification: "30 extra lives granted" in monospace, accent border, slides up, fades out after 3s
- Load via `requestIdleCallback` for zero render impact
- Total JS under 1KB
- Add to base-layout as inline script or small separate file

## Files to Modify

- `src/styles/global.css` — accent color vars, contrast bumps, cursor animation, isometric grid
- `src/layouts/base-layout.astro` — terminal cursor, fretboard dots, footer LED, Konami script
- `src/components/post-meta.astro` — monospace dates with git-branch icon
- `src/components/post-list.astro` — hover translate, accent color on hover
- `src/pages/index.astro` — h1 size, circuit dividers
- `src/pages/about.astro` — circuit dividers
- `src/pages/blog/index.astro` — circuit dividers
- `src/components/search.tsx` — accent color updates
- `src/components/tag-filter.tsx` — tag pill visibility updates

## Files to Create

- `src/components/circuit-divider.astro` — reusable PCB trace SVG divider
- `src/pages/404.astro` — Game Over 404 page

## What's NOT Changing

- Layout (max-w-2xl single column)
- System font stack (no custom fonts)
- Astro/React/Tailwind architecture
- Content, routes, functionality
- Dark theme foundation (gray-950 background)
