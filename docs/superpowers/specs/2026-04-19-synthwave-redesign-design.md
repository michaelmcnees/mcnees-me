# Synthwave Redesign — Design

**Date:** 2026-04-19
**Status:** Approved for implementation planning
**Source:** Claude Design handoff bundle (`portfolio/project/dvflw.html`), chat transcript `portfolio/chats/chat1.md`.

## Goal

Full visual overhaul of mcnees.me from the current minimalist dark + electric-blue theme to a neon synthwave aesthetic — animated grid floor, striped sunset sun, chromatic glow, Cyan→Magenta gradients, CRT scanlines. The current site's content, routes, and interactive features (Pagefind search, tag filter, views API, Konami easter egg) stay intact; only the visual layer changes.

The design handoff was produced in Claude Design as a single-file HTML prototype. This spec translates that prototype into the existing Astro multi-page architecture without copying the prototype's internal structure.

## Decisions locked

- **Scope:** Option A — full overhaul. Synthwave is the site; there is no "classic" toggle.
- **Default accent:** `cyan` (magenta as secondary). Design default preserved.
- **Tweaks panel:** shipped but hidden behind a backtick (`` ` ``) keyboard shortcut. Persists to `localStorage["dvflw.tweaks"]`. Controls: `vibe` (minimal/classic/full), `accentHue` (cyan/violet/magenta/sunset), `glow`, `horizon`, `gridFloor`, `scan`.
- **Reading-mode backdrop:** blog detail + case study detail set `data-reading="true"` on `<body>`. CSS reduces `--scan-alpha` and pauses `.floor::before` animation.
- **Hero element on home:** Player 1 ID card replaces the triangle SVG from the design.
- **Konami easter egg:** existing "30 extra lives" behavior preserved unchanged.

## Architecture

### Global shell

`base-layout.astro` rewrites to:

```
<body [data-reading]>
  <Backdrop />                         <!-- fixed, z:-2; stars, sun, sky, mountains, floor -->
  <Scanlines />                        <!-- fixed, z:50; repeating-linear-gradient, mix-blend -->
  <Vignette />                         <!-- fixed, z:49; radial gradient -->
  <ScrollIndicator />                  <!-- fixed right edge, always visible -->
  <TweaksPanel hidden />               <!-- backtick to toggle -->
  <div class="shell">                  <!-- flex-column, min-height:100vh -->
    <header class="top">
      <Brand />
      <nav class="primary" />
      <Sysbar />
    </header>
    <main class="page">
      <slot />
    </main>
    <footer class="bottom" />
  </div>
</body>
```

Sticky footer via `flex: 1 0 auto` on `.page` and `margin-top: auto` on `footer.bottom` (same pattern as the design prototype's final state).

### Design tokens

`src/styles/synthwave.css`:

```css
:root {
  --bg-0: #05020f;
  --bg-1: #0a0520;
  --bg-2: #140832;
  --mag: #ff2bd6;
  --mag-2: #ff62e6;
  --cyan: #22e7ff;
  --cyan-2: #7df4ff;
  --violet: #8a4cff;
  --yellow: #f9d65c;
  --orange: #ff6a3d;
  --white: #ecf6ff;
  --dim: #8a7fb0;
  --rule: rgba(138, 76, 255, 0.25);

  --font-display: "Orbitron", "Space Grotesk", sans-serif;
  --font-body: "Space Grotesk", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-pixel: "VT323", ui-monospace, monospace;

  --glow: 0.85;
  --scan-alpha: 0.30;
  --horizon: 0.55;
  --floor-opacity: 0.7;
}

body[data-reading="true"] {
  --scan-alpha: 0.12;
  --floor-opacity: 0.38;
}
body[data-reading="true"] .floor::before { animation-play-state: paused; }
```

Existing Material-style tokens in `global.css` (`--color-on-surface`, etc.) are aliased to the synthwave tokens so existing component CSS continues to render while we restyle.

### Custom scrollbar

Native scrollbars hidden site-wide:

```css
html { scrollbar-width: none; -ms-overflow-style: none; }
html::-webkit-scrollbar { display: none; }
body::-webkit-scrollbar { display: none; }
```

`scroll-indicator.astro` renders a fixed right-edge rail with:

- Dashed violet track (`--violet` with dash pattern via `background-image`).
- Draggable thumb with cyan→magenta gradient + glow.
- Live `%` readout in monospace above the thumb.
- Updates on `scroll`, `resize`, and client-side route changes.

### Tweaks panel

Hidden by default, toggled via `keydown` on backtick. When open:

- Fixed bottom-right, panel-styled card.
- Reads `window.__TWEAKS` defaults, overlays `localStorage["dvflw.tweaks"]`.
- Radio for `vibe` + `accentHue`; range sliders for `glow`, `horizon`, `gridFloor`, `scan`.
- Writes CSS vars on `:root` live; persists on change.

## Per-page plan

### Home (`src/pages/index.astro`)

Two-column hero on `sm+`, stacked on mobile:

- Left column:
  - `.hero-tagline` mono row with leading cyan rule: `ENGINEERING // BUILDER // WRITER`.
  - `h1.hero-title` Orbitron 900 gradient (white → magenta → violet), clamp 40–72px, with sub line in cyan-2 letter-spacing 0.6em: `MICHAEL McNEES` / `// SYSTEM ONLINE`.
  - `.hero-bio` — existing one-paragraph bio.
  - `.hero-ctas` — primary magenta "Get in touch" + ghost cyan "GitHub" + ghost cyan "GitLab".
- Right column: `<PlayerCard size="hero" />`.

Below the hero, latest-posts panel (`// NODE_01 :: LATEST`) using restyled `post-list.astro`.

### Blog index (`src/pages/blog/index.astro`)

Panel (`// NODE_02 :: ARCHIVE`). Search + TagFilter React components wrapped so their chrome is synthwave (neon focus ring, magenta active chip). PostList items gain hover-glow (cyan text-shadow) + mono date meta.

### Blog detail (`src/pages/blog/[slug].astro`)

Sets `<body data-reading="true">`. Panel (`// TRANSMISSION`). Orbitron H1 + gradient (reduced size vs. hero). PostMeta mono. Prose body stays Space Grotesk at comfortable reading size; headings Orbitron (h2 28px, h3 22px). Code blocks keep JetBrains Mono with cyan 1px border + soft glow.

### Case studies index (`src/pages/case-studies/index.astro`)

Panel (`// NODE_03 :: DOSSIERS`). CaseStudyCard restyled: neon-rule divider between, cyan left-border accent, hover translate-x + text-shadow preserved.

### Case study detail (`src/pages/case-studies/[slug].astro`)

Reading mode. Panel (`// DOSSIER`). Sidebar becomes "dossier" with mono labels (already uppercase), neon rule between rows, cyan term / white description.

### Projects index (`src/pages/projects/index.astro`)

Panel (`// NODE_04 :: BUILDS`). ProjectCard restyled. StatusBadge colors:

- `alpha` → `--orange`
- `beta` → `--cyan`
- `stable` → `oklch(0.72 0.15 155)` (green)

Each with uniform glow + 1px neon border. Stack chips gain a neon bottom-border underline (replaces existing left-border color chip).

### About (`src/pages/about.astro`)

Panel (`// OPERATOR`). `<PlayerCard size="about" />` as hero. `about-timeline.astro` restyled as synthwave timeline: vertical violet rail, each entry a small nested panel with a cyan dot marker.

### 404 (`src/pages/404.astro`)

Panel (`// SIGNAL LOST`). Scrambled ASCII block + "RETURN TO BASE" primary button to `/`.

## Nav

Header grid: `[brand] [nav.primary] [sysbar]`. On mobile (`< sm`), stack nav below brand (preserving the overflow fix shipped earlier). Nav active state = magenta text + glow + inset magenta border.

Sysbar contents: pulsing green LED + `SYSTEM ONLINE · <live clock, mono>`.

## Components

### New

| File | Responsibility |
|------|----------------|
| `src/components/backdrop.astro` | Stars, planet, sun, sky, horizon-glow, mountains SVG (with `<linearGradient id="mgrad">`), floor div. Reads `--horizon`, `--floor-opacity`, `--glow`. |
| `src/components/scanlines.astro` | Fixed z:50 scanline overlay, reads `--scan-alpha`. |
| `src/components/vignette.astro` | Fixed z:49 radial vignette. |
| `src/components/brand.astro` | Logo SVG + name + sub label. |
| `src/components/sysbar.astro` | Status LED + live clock (`<script>` updates every 1s). |
| `src/components/panel.astro` | `<section class="panel">` wrapper with `title` + `sub` props. Title/sub excluded from bootup fade per design chat. |
| `src/components/scroll-indicator.astro` | Right-edge rail, draggable thumb, % readout. Client JS. |
| `src/components/tweaks-panel.astro` | Hidden controls panel, backtick toggle, localStorage + CSS var writes. |
| `src/components/player-card.astro` | Player 1 ID card. Prop `size: "hero" | "about"`. Renders pixel portrait silhouette, stat rows. Hero variant compact (~460px); about variant larger with more stats. |
| `src/components/status-led.astro` | Small reusable dot component for status indication. |

### Modified (restyle only, no API change)

`post-list.astro`, `post-meta.astro`, `search.tsx`, `tag-filter.tsx`, `case-study-card.astro`, `case-study-sidebar.astro`, `project-card.astro`, `status-badge.astro`, `stack-chip.astro`, `about-timeline.astro`.

### Unchanged

Content schemas, MDX content, `src/pages/api/views/*`, Pagefind indexing, Konami easter egg JS inside `base-layout.astro`.

## Fonts

Google Fonts link updated to load:

- Orbitron 500/700/900
- Space Grotesk 400/500/600/700 (existing)
- JetBrains Mono 400/500 (existing)
- VT323

## Testing / verification

1. `bun run build` — clean, all 13 pages generate, no schema errors.
2. Preview dev server on desktop (1280) and mobile (375):
   - Backdrop renders; grid animation runs on `/`, `/blog`, `/case-studies`, `/projects`, `/about`, `/404`.
   - Grid animation paused on `/blog/*` and `/case-studies/*` detail pages.
   - Scanlines dimmer on reading pages (visually check `--scan-alpha`).
   - Scroll indicator visible on every page, draggable, updates on scroll + navigation + resize.
   - Backtick opens tweaks panel; accent change reflects live; localStorage persists across reload.
   - Konami code still grants "30 extra lives" toast + scanline flash.
   - Pagefind search returns results; TagFilter filters correctly.
   - Case study sidebar still stacks above narrative on mobile.
   - Views API endpoint `/api/views/:slug` still records hits (POST from existing script).
   - No browser console errors.
3. Lighthouse on `/` and one blog post — performance score no worse than 10 points below current baseline.

## Out of scope (YAGNI)

- No new routes.
- No "classic theme" toggle — synthwave is the site.
- No audio / chiptune.
- No changes to blog/case-study/project MDX content.
- No redesign of views API or RSS.
- No server-side rendering changes.
- No new content migrations.

## Open questions

None. All decisions locked above.
