# Synthwave Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mcnees.me's current minimalist dark theme with a full neon synthwave aesthetic (animated grid floor, sun, scanlines, cyan/magenta glow, Orbitron headings) while preserving all content, routes, and interactive features.

**Architecture:** Port the single-file HTML prototype at `docs/superpowers/design-source/dvflw.html` into the existing Astro multi-page site. Adds a new global stylesheet (`src/styles/synthwave.css`), nine new components (backdrop, scanlines, vignette, brand, sysbar, panel, scroll-indicator, tweaks-panel, player-card, status-led), and restyles every existing component/page. The content collections, Pagefind search, views API, and Konami easter egg are unchanged.

**Tech Stack:** Astro 5, MDX, Tailwind CSS v4, React 19 (existing interactive components), Bun.

**Spec:** `docs/superpowers/specs/2026-04-19-synthwave-redesign-design.md`
**Design source:** `docs/superpowers/design-source/dvflw.html` (read this before implementation — line numbers referenced throughout)

**Verification note:** No automated test suite. Every task verifies via `bun run build` + dev-server preview. Commit after each task.

---

## Task 1: Design tokens + global stylesheet

**Files:**
- Create: `src/styles/synthwave.css`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/base-layout.astro:30-32` (font link)

- [ ] **Step 1: Create `src/styles/synthwave.css`**

```css
/* Synthwave design tokens — ported from docs/superpowers/design-source/dvflw.html lines 22-48 */
:root {
  /* palette */
  --sw-bg-0: #05020f;
  --sw-bg-1: #0a0520;
  --sw-bg-2: #140832;

  --sw-mag: #ff2bd6;
  --sw-mag-2: #ff62e6;
  --sw-cyan: #22e7ff;
  --sw-cyan-2: #7df4ff;
  --sw-violet: #8a4cff;
  --sw-yellow: #f9d65c;
  --sw-orange: #ff6a3d;
  --sw-white: #ecf6ff;
  --sw-dim: #8a7fb0;
  --sw-rule: rgba(138, 76, 255, 0.25);

  /* runtime-tunable (tweaks panel writes these) */
  --mag: var(--sw-mag);
  --mag-2: var(--sw-mag-2);
  --cyan: var(--sw-cyan);
  --cyan-2: var(--sw-cyan-2);
  --violet: var(--sw-violet);

  --glow: 0.85;
  --scan-alpha: 0.30;
  --horizon: 0.55;
  --floor-opacity: 0.7;

  --font-display: "Orbitron", "Space Grotesk", sans-serif;
  --font-body: "Space Grotesk", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-pixel: "VT323", ui-monospace, monospace;
}

/* Hide native scrollbars site-wide (custom scroll indicator replaces them) */
html { scrollbar-width: none; -ms-overflow-style: none; }
html::-webkit-scrollbar { width: 0; height: 0; display: none; }
body { scrollbar-width: none; }
body::-webkit-scrollbar { width: 0; height: 0; display: none; }

/* Sticky-footer shell */
body {
  background: var(--sw-bg-0);
  color: var(--sw-white);
  font-family: var(--font-body);
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Reading mode: dim backdrop on blog/case-study detail pages */
body[data-reading="true"] {
  --scan-alpha: 0.12;
  --floor-opacity: 0.38;
}
body[data-reading="true"] .sw-floor::before {
  animation-play-state: paused;
}

/* Selection */
::selection { background: var(--mag); color: #fff; }

/* Panel primitive */
.panel {
  border: 1px solid rgba(34, 231, 255, 0.25);
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(20, 8, 50, 0.6), rgba(10, 2, 32, 0.75));
  position: relative;
  box-shadow:
    inset 0 0 0 1px rgba(255, 43, 214, 0.08),
    0 0 18px rgba(138, 76, 255, calc(0.15 * var(--glow)));
}
.panel-title {
  position: absolute;
  top: -9px;
  left: 16px;
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.3em;
  background: var(--sw-bg-0);
  padding: 0 10px;
  color: var(--cyan-2);
  text-shadow: 0 0 6px rgba(34, 231, 255, 0.7);
}
.panel-sub {
  position: absolute;
  top: -9px;
  right: 16px;
  font-family: var(--font-mono);
  font-size: 10px;
  background: var(--sw-bg-0);
  padding: 0 10px;
  color: var(--mag-2);
  letter-spacing: 0.2em;
}

/* Bootup fade excluded for panel-title / panel-sub */
.page.active > .panel > :not(.panel-title):not(.panel-sub),
.page.active > * > :not(.panel-title):not(.panel-sub) {
  animation: sw-boot 0.45s ease-out both;
}
@keyframes sw-boot {
  0%   { opacity: 0; transform: translateY(6px); filter: blur(3px) saturate(200%); }
  100% { opacity: 1; transform: none; filter: none; }
}

/* Button primitives */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--sw-white);
  padding: 12px 18px;
  border: 1px solid;
  border-radius: 3px;
  background: rgba(10, 2, 32, 0.6);
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
}
.btn.primary {
  border-color: var(--mag);
  color: var(--mag-2);
  box-shadow:
    inset 0 0 0 1px rgba(255, 43, 214, 0.3),
    0 0 12px rgba(255, 43, 214, 0.55),
    0 0 24px rgba(255, 43, 214, 0.25);
  text-shadow: 0 0 6px rgba(255, 43, 214, 0.9);
}
.btn.primary:hover {
  color: #fff;
  box-shadow:
    inset 0 0 0 1px rgba(255, 43, 214, 0.6),
    0 0 18px rgba(255, 43, 214, 0.85),
    0 0 36px rgba(255, 43, 214, 0.45);
}
.btn.ghost {
  border-color: var(--cyan);
  color: var(--cyan-2);
  box-shadow:
    inset 0 0 0 1px rgba(34, 231, 255, 0.25),
    0 0 10px rgba(34, 231, 255, 0.4);
  text-shadow: 0 0 4px rgba(34, 231, 255, 0.8);
}
.btn.ghost:hover {
  color: #fff;
  box-shadow:
    inset 0 0 0 1px rgba(34, 231, 255, 0.55),
    0 0 16px rgba(34, 231, 255, 0.7),
    0 0 28px rgba(34, 231, 255, 0.35);
}
.btn .arrow { font-family: var(--font-mono); }

/* Section head ("▶ SECTION // meta") */
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 72px 0 20px;
  gap: 24px;
}
.section-head h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.25em;
  margin: 0;
  text-transform: uppercase;
  color: var(--sw-white);
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
.section-head h2::before {
  content: "▶";
  color: var(--mag-2);
  font-size: 14px;
  text-shadow: 0 0 8px var(--mag);
}
.section-head .meta {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--cyan-2);
  text-transform: uppercase;
}
.section-head .right {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--mag-2);
  letter-spacing: 0.22em;
  text-decoration: none;
  text-transform: uppercase;
}
.section-head .right:hover { text-shadow: 0 0 6px var(--mag); }
```

- [ ] **Step 2: Add the synthwave stylesheet import to `src/styles/global.css` at the top**

Add this as the very first line of `src/styles/global.css`:

```css
@import "./synthwave.css";
```

- [ ] **Step 3: Update the font preconnect in `src/layouts/base-layout.astro:30-32`**

Find:
```astro
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

Replace with:
```astro
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=VT323&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

- [ ] **Step 4: Build to confirm CSS parses**

Run: `bun run build`
Expected: build completes, no CSS parse errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/synthwave.css src/styles/global.css src/layouts/base-layout.astro
git commit -m "feat: add synthwave design tokens and base stylesheet"
```

---

## Task 2: Backdrop component

Full animated backdrop: sky gradient, twinkling stars, planet with rings, sun with striped gradient mask, horizon glow, distant mountain wireframes, neon grid floor. Copy CSS from design source lines 70-263 and 211-263.

**Files:**
- Create: `src/components/backdrop.astro`

- [ ] **Step 1: Create `src/components/backdrop.astro`**

```astro
---
// Synthwave backdrop: stars, planet, sun, mountains, grid floor.
// Ported from docs/superpowers/design-source/dvflw.html lines 1274-1297.
---
<div class="sw-backdrop" aria-hidden="true">
  <div class="sw-sky"></div>
  <div class="sw-stars"></div>
  <div class="sw-planet"></div>
  <div class="sw-mountains">
    <svg viewBox="0 0 600 140" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sw-mgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff62e6"/>
          <stop offset="100%" stop-color="#22e7ff"/>
        </linearGradient>
      </defs>
      <path d="M0,140 L40,90 L85,120 L130,70 L165,100 L210,55 L255,95 L290,70 L330,105 L370,80 L410,120 L460,85 L500,115 L550,80 L600,120 L600,140 Z" stroke="url(#sw-mgrad)"/>
      <path d="M0,140 L25,115 L55,125 L90,100 L120,115 L155,95 L200,120 L240,100 L290,120 L330,105 L380,125 L420,115 L470,130 L520,110 L600,130 L600,140 Z" opacity="0.55" stroke="url(#sw-mgrad)"/>
    </svg>
    <svg viewBox="0 0 600 140" preserveAspectRatio="none">
      <path d="M0,140 L30,80 L75,115 L115,60 L155,100 L195,50 L240,95 L285,65 L325,100 L365,75 L410,120 L450,80 L495,115 L540,75 L600,115 L600,140 Z" stroke="url(#sw-mgrad)"/>
      <path d="M0,140 L35,120 L75,130 L115,105 L155,120 L195,95 L235,125 L280,105 L325,125 L375,115 L420,130 L470,120 L520,135 L580,115 L600,125 L600,140 Z" opacity="0.55" stroke="url(#sw-mgrad)"/>
    </svg>
  </div>
  <div class="sw-sun"></div>
  <div class="sw-horizon-glow"></div>
  <div class="sw-floor"></div>
</div>

<style>
  .sw-backdrop {
    position: fixed;
    inset: 0;
    z-index: -2;
    overflow: hidden;
    pointer-events: none;
  }

  .sw-stars {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(2px 2px at 12% 18%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 22% 42%, #c8b8ff 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 38% 12%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 55% 28%, #8ae9ff 50%, transparent 51%),
      radial-gradient(2px 2px at 72% 8%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 81% 35%, #e0d2ff 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 92% 22%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 7% 6%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 48% 48%, #aeb8ff 50%, transparent 51%),
      radial-gradient(1px 1px at 65% 52%, #e0caff 50%, transparent 51%);
    opacity: 0.9;
    animation: sw-twinkle 6s ease-in-out infinite;
  }
  @keyframes sw-twinkle {
    0%, 100% { opacity: 0.9; }
    50%      { opacity: 0.55; }
  }

  .sw-planet {
    position: absolute;
    width: 180px; height: 180px;
    top: 8%;
    right: 10%;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffe6fb 0%, #ff8fe7 25%, #8a4cff 65%, rgba(138,76,255,0) 72%);
    filter: blur(0.4px) drop-shadow(0 0 40px rgba(255, 43, 214, 0.45));
    opacity: calc(0.85 * var(--glow));
  }
  .sw-planet::after {
    content: "";
    position: absolute;
    left: -8%; right: -8%;
    top: 50%;
    height: 8px;
    transform: translateY(-50%) rotate(-10deg);
    background: linear-gradient(90deg, transparent, rgba(34,231,255,.6), rgba(255,43,214,.5), transparent);
    filter: blur(1px);
    border-radius: 50%;
    opacity: 0.75;
  }

  .sw-sky {
    position: absolute;
    inset: 0 0 calc(100% - var(--horizon) * 100%) 0;
    background: linear-gradient(180deg, #0a0220 0%, #1a0540 35%, #3a0a6b 70%, #691a8a 100%);
  }

  .sw-sun {
    position: absolute;
    left: 50%;
    bottom: calc(var(--horizon) * 100% - 2px);
    transform: translate(-50%, 50%);
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background:
      linear-gradient(180deg, #fff5c7 0%, #f9d65c 18%, #ff9c3a 40%, #ff4da6 65%, #b03cff 88%);
    filter: drop-shadow(0 0 60px rgba(255, 106, 61, calc(0.5 * var(--glow))))
            drop-shadow(0 0 100px rgba(255, 43, 214, calc(0.45 * var(--glow))));
    mask:
      linear-gradient(#000, #000),
      repeating-linear-gradient(180deg,
        transparent 0,
        transparent calc(50% + 60px),
        #000 calc(50% + 60px),
        #000 calc(50% + 68px),
        transparent calc(50% + 68px),
        transparent calc(50% + 82px),
        #000 calc(50% + 82px),
        #000 calc(50% + 92px),
        transparent calc(50% + 92px),
        transparent calc(50% + 112px),
        #000 calc(50% + 112px),
        #000 calc(50% + 124px),
        transparent calc(50% + 124px),
        transparent calc(50% + 150px),
        #000 calc(50% + 150px),
        #000 calc(50% + 164px),
        transparent calc(50% + 164px));
    mask-composite: subtract;
    -webkit-mask:
      linear-gradient(#000, #000),
      repeating-linear-gradient(180deg,
        transparent 0,
        transparent calc(50% + 60px),
        #000 calc(50% + 60px),
        #000 calc(50% + 68px),
        transparent calc(50% + 68px),
        transparent calc(50% + 82px),
        #000 calc(50% + 82px),
        #000 calc(50% + 92px),
        transparent calc(50% + 92px),
        transparent calc(50% + 112px),
        #000 calc(50% + 112px),
        #000 calc(50% + 124px),
        transparent calc(50% + 124px),
        transparent calc(50% + 150px),
        #000 calc(50% + 150px),
        #000 calc(50% + 164px),
        transparent calc(50% + 164px));
    -webkit-mask-composite: source-out;
    opacity: 0.92;
  }

  .sw-horizon-glow {
    position: absolute;
    left: 0; right: 0;
    bottom: calc(var(--horizon) * 100% - 2px);
    height: 4px;
    background: linear-gradient(90deg,
      transparent 0%, #22e7ff 20%, #ff2bd6 50%, #22e7ff 80%, transparent 100%);
    filter: blur(1px) drop-shadow(0 0 12px rgba(255, 43, 214, 0.9))
                      drop-shadow(0 0 24px rgba(34, 231, 255, 0.6));
    opacity: calc(0.9 * var(--glow));
  }

  .sw-floor {
    position: absolute;
    left: -10%;
    right: -10%;
    top: calc(var(--horizon) * 100%);
    bottom: 0;
    perspective: 500px;
    overflow: hidden;
    opacity: var(--floor-opacity);
  }
  .sw-floor::before {
    content: "";
    position: absolute;
    left: -25%;
    right: -25%;
    top: 0;
    height: 220%;
    transform-origin: 50% 0%;
    transform: rotateX(62deg);
    background:
      linear-gradient(to right,
        transparent calc(50% - 1px),
        rgba(34, 231, 255, 0.7) calc(50% - 1px),
        rgba(34, 231, 255, 0.7) calc(50% + 1px),
        transparent calc(50% + 1px)),
      repeating-linear-gradient(90deg,
        rgba(34, 231, 255, 0.55) 0,
        rgba(34, 231, 255, 0.55) 1px,
        transparent 1px,
        transparent 56px),
      repeating-linear-gradient(0deg,
        rgba(255, 43, 214, 0.55) 0,
        rgba(255, 43, 214, 0.55) 1px,
        transparent 1px,
        transparent 60px);
    filter: drop-shadow(0 0 6px rgba(34, 231, 255, calc(0.9 * var(--glow))))
            drop-shadow(0 0 8px rgba(255, 43, 214, calc(0.55 * var(--glow))));
    animation: sw-gridscroll 3.2s linear infinite;
  }
  @keyframes sw-gridscroll {
    from { background-position: 0 0, 0 0, 0 0; }
    to   { background-position: 0 0, 0 0, 0 60px; }
  }
  .sw-floor::after {
    content: "";
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg, var(--sw-bg-0) 0%, rgba(10,2,32,0) 18%, rgba(10,2,32,0) 80%, var(--sw-bg-0) 100%),
      radial-gradient(ellipse at 50% 0%, rgba(255, 43, 214, 0.35) 0%, transparent 60%);
    pointer-events: none;
  }

  .sw-mountains {
    position: absolute;
    left: 0; right: 0;
    bottom: calc(var(--horizon) * 100%);
    height: 140px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    opacity: 0.85;
    pointer-events: none;
  }
  .sw-mountains svg { width: 45%; height: 140px; overflow: visible; }
  .sw-mountains path {
    fill: none;
    stroke-width: 1.2;
    filter: drop-shadow(0 0 4px rgba(34, 231, 255, calc(0.8 * var(--glow))));
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/backdrop.astro
git commit -m "feat: add synthwave backdrop component"
```

---

## Task 3: Scanlines + vignette components

**Files:**
- Create: `src/components/scanlines.astro`
- Create: `src/components/vignette.astro`

- [ ] **Step 1: Create `src/components/scanlines.astro`**

```astro
---
// CRT scanline overlay. Reads --scan-alpha from :root (tweaks panel + reading mode write this).
---
<div class="sw-scanlines" aria-hidden="true"></div>

<style>
  .sw-scanlines {
    position: fixed;
    inset: 0;
    z-index: 50;
    pointer-events: none;
    background: repeating-linear-gradient(0deg,
      rgba(255,255,255,0) 0,
      rgba(255,255,255,0) 2px,
      rgba(0,0,0, var(--scan-alpha)) 2px,
      rgba(0,0,0, var(--scan-alpha)) 3px);
    mix-blend-mode: multiply;
  }
</style>
```

- [ ] **Step 2: Create `src/components/vignette.astro`**

```astro
---
// Radial darkening vignette at the edges.
---
<div class="sw-vignette" aria-hidden="true"></div>

<style>
  .sw-vignette {
    position: fixed;
    inset: 0;
    z-index: 49;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/scanlines.astro src/components/vignette.astro
git commit -m "feat: add scanlines and vignette overlay components"
```

---

## Task 4: Brand component

Neon triangle logo SVG + "MCNEES" wordmark + "//NEON.SYS" sub label.

**Files:**
- Create: `src/components/brand.astro`

- [ ] **Step 1: Create `src/components/brand.astro`**

```astro
---
// Brand mark: neon triangle logo + wordmark. Ported from design lines 1310-1331.
---
<a class="sw-brand" href="/">
  <span class="sw-logo">
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <polygon points="20,4 36,34 4,34" stroke="url(#sw-lg1)" stroke-width="2" fill="none"/>
      <polygon points="20,14 30,32 10,32" stroke="url(#sw-lg2)" stroke-width="1.5" fill="none" opacity="0.8"/>
      <defs>
        <linearGradient id="sw-lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#22e7ff"/>
          <stop offset="1" stop-color="#ff2bd6"/>
        </linearGradient>
        <linearGradient id="sw-lg2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#ff2bd6"/>
          <stop offset="1" stop-color="#22e7ff"/>
        </linearGradient>
      </defs>
    </svg>
  </span>
  <span class="sw-brand-text">
    <span class="sw-brand-name">MCNEES</span>
    <span class="sw-brand-sub">//NEON.SYS v2.86</span>
  </span>
</a>

<style>
  .sw-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    justify-self: start;
    text-decoration: none;
    color: var(--sw-white);
  }
  .sw-logo {
    width: 38px; height: 38px;
    position: relative;
  }
  .sw-logo svg {
    display: block;
    width: 100%; height: 100%;
    filter: drop-shadow(0 0 8px rgba(34, 231, 255, calc(0.9 * var(--glow))))
            drop-shadow(0 0 12px rgba(255, 43, 214, calc(0.55 * var(--glow))));
  }
  .sw-brand-name {
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 0.18em;
    font-size: 14px;
    display: block;
  }
  .sw-brand-sub {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--cyan-2);
    letter-spacing: 0.3em;
    margin-top: 2px;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/brand.astro
git commit -m "feat: add synthwave brand component"
```

---

## Task 5: Sysbar component

Pulsing green LED + live clock + "SYS ONLINE" text.

**Files:**
- Create: `src/components/sysbar.astro`

- [ ] **Step 1: Create `src/components/sysbar.astro`**

```astro
---
// System bar: pulsing LED + live clock + status. JS updates clock every 1s.
---
<div class="sw-sysbar" aria-label="System status">
  <span class="sw-led"></span>
  <span id="sw-sys-time">--:--:--</span>
  <span>SYS ONLINE</span>
</div>

<style>
  .sw-sysbar {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 14px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--cyan-2);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .sw-led {
    width: 8px; height: 8px; border-radius: 50%;
    background: #6bff9e;
    box-shadow: 0 0 8px #6bff9e, 0 0 16px rgba(107, 255, 158, 0.5);
    animation: sw-led 2.4s ease-in-out infinite;
  }
  @keyframes sw-led {
    0%, 100% { box-shadow: 0 0 8px #6bff9e, 0 0 16px rgba(107, 255, 158, 0.5); }
    50%      { box-shadow: 0 0 4px #6bff9e, 0 0 8px rgba(107, 255, 158, 0.3); }
  }
</style>

<script is:inline>
  (function () {
    const el = document.getElementById('sw-sys-time');
    if (!el) return;
    const pad = (n) => String(n).padStart(2, '0');
    function tick() {
      const d = new Date();
      el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    tick();
    setInterval(tick, 1000);
  })();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sysbar.astro
git commit -m "feat: add sysbar component with live clock"
```

---

## Task 6: Panel wrapper component

Reusable `<section class="panel">` with `title` + `sub` props.

**Files:**
- Create: `src/components/panel.astro`

- [ ] **Step 1: Create `src/components/panel.astro`**

```astro
---
interface Props {
  title?: string;
  sub?: string;
  class?: string;
}
const { title, sub, class: className = "" } = Astro.props;
---
<section class:list={["panel", className]}>
  {title && <span class="panel-title">{title}</span>}
  {sub && <span class="panel-sub">{sub}</span>}
  <slot />
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/panel.astro
git commit -m "feat: add panel wrapper component"
```

---

## Task 7: Scroll indicator component

Right-edge dashed rail + draggable cyan→magenta thumb + live % readout. Replaces native scrollbars (hidden in Task 1 stylesheet).

**Files:**
- Create: `src/components/scroll-indicator.astro`

- [ ] **Step 1: Create `src/components/scroll-indicator.astro`**

```astro
---
// Custom synthwave scroll indicator. Native scrollbars are hidden in synthwave.css.
// JS ported from design source lines 2001-2064.
---
<div id="sw-scrollrail" aria-hidden="true"></div>
<div id="sw-scrollthumb" aria-hidden="true"></div>
<div id="sw-scrollpct" aria-hidden="true">00%</div>

<style>
  #sw-scrollrail {
    position: fixed;
    top: 80px;
    bottom: 80px;
    right: 10px;
    width: 6px;
    z-index: 60;
    pointer-events: none;
    background: linear-gradient(180deg,
      rgba(34, 231, 255, 0.0),
      rgba(34, 231, 255, 0.18),
      rgba(255, 43, 214, 0.18),
      rgba(255, 43, 214, 0.0));
    border-radius: 3px;
    box-shadow: inset 0 0 0 1px rgba(138, 76, 255, 0.2);
  }
  #sw-scrollrail::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0; bottom: 0;
    width: 1px;
    transform: translateX(-50%);
    background: repeating-linear-gradient(180deg,
      rgba(138, 76, 255, 0.35) 0 6px,
      transparent 6px 12px);
  }
  #sw-scrollthumb {
    position: fixed;
    right: 6px;
    width: 14px;
    height: 60px;
    z-index: 61;
    pointer-events: auto;
    cursor: grab;
    border-radius: 2px;
    background: linear-gradient(180deg, var(--cyan) 0%, var(--mag) 100%);
    box-shadow:
      0 0 10px rgba(34, 231, 255, calc(0.8 * var(--glow))),
      0 0 18px rgba(255, 43, 214, calc(0.6 * var(--glow))),
      inset 0 0 0 1px rgba(255, 255, 255, 0.25);
    transition: height 0.15s ease, transform 0.08s ease;
  }
  #sw-scrollthumb::before {
    content: "";
    position: absolute;
    inset: 4px 4px;
    border-left: 1px solid rgba(255, 255, 255, 0.45);
    border-right: 1px solid rgba(255, 255, 255, 0.45);
    background: repeating-linear-gradient(180deg,
      rgba(255, 255, 255, 0.25) 0 1px,
      transparent 1px 4px);
  }
  #sw-scrollthumb:hover { transform: scaleX(1.15); }
  #sw-scrollthumb.dragging { cursor: grabbing; }
  #sw-scrollpct {
    position: fixed;
    right: 26px;
    z-index: 61;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--cyan-2);
    background: rgba(10, 2, 32, 0.8);
    border: 1px solid rgba(34, 231, 255, 0.3);
    padding: 2px 6px;
    border-radius: 2px;
    pointer-events: none;
    text-shadow: 0 0 4px rgba(34, 231, 255, 0.6);
    transform: translateY(-50%);
  }
</style>

<script is:inline>
  (function () {
    const thumb = document.getElementById('sw-scrollthumb');
    const pct = document.getElementById('sw-scrollpct');
    const rail = document.getElementById('sw-scrollrail');
    if (!thumb || !pct || !rail) return;
    const RAIL_TOP = 80, RAIL_BOTTOM = 80;

    function updateScroll() {
      const vh = window.innerHeight;
      const dh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const maxScroll = Math.max(0, dh - vh);
      const railH = vh - RAIL_TOP - RAIL_BOTTOM;
      const tH = Math.max(40, Math.min(railH, (vh / dh) * railH));
      thumb.style.height = tH + 'px';

      const p = maxScroll > 0 ? (window.scrollY / maxScroll) : 0;
      const travel = railH - tH;
      const y = RAIL_TOP + p * travel;
      thumb.style.top = y + 'px';

      if (maxScroll <= 2) {
        thumb.style.opacity = '0.35';
        rail.style.opacity = '0.5';
      } else {
        thumb.style.opacity = '1';
        rail.style.opacity = '1';
      }

      pct.textContent = String(Math.round(p * 100)).padStart(2, '0') + '%';
      pct.style.top = (y + tH / 2) + 'px';
    }
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);

    let dragging = false, dragStartY = 0, dragStartScroll = 0;
    thumb.addEventListener('pointerdown', (e) => {
      dragging = true;
      dragStartY = e.clientY;
      dragStartScroll = window.scrollY;
      thumb.classList.add('dragging');
      thumb.setPointerCapture(e.pointerId);
    });
    thumb.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const vh = window.innerHeight;
      const dh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const maxScroll = Math.max(0, dh - vh);
      const railH = vh - RAIL_TOP - RAIL_BOTTOM;
      const tH = thumb.offsetHeight;
      const travel = railH - tH;
      const dy = e.clientY - dragStartY;
      const newScroll = dragStartScroll + (dy / travel) * maxScroll;
      window.scrollTo({ top: newScroll, behavior: 'instant' });
    });
    thumb.addEventListener('pointerup', () => {
      dragging = false;
      thumb.classList.remove('dragging');
    });
  })();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/scroll-indicator.astro
git commit -m "feat: add custom synthwave scroll indicator"
```

---

## Task 8: Tweaks panel

Hidden controls panel toggled via backtick. Persists to `localStorage["dvflw.tweaks"]`. Writes CSS vars on `:root`.

**Files:**
- Create: `src/components/tweaks-panel.astro`

- [ ] **Step 1: Create `src/components/tweaks-panel.astro`**

```astro
---
// Tweaks panel — hidden by default, toggled via backtick.
// Controls: vibe (minimal|classic|full), accentHue (cyan|violet|magenta|sunset),
// glow, horizon, gridFloor, scan. Persists to localStorage "dvflw.tweaks".
---
<div id="sw-tweaks" aria-hidden="true">
  <h3>
    <span>TWEAKS</span>
    <span style="color: var(--cyan-2); font-size: 10px; letter-spacing: 0.2em;">NEON.CTRL</span>
  </h3>

  <label>VIBE</label>
  <div class="sw-vibe-row" id="sw-vibe-row">
    <button type="button" data-vibe="minimal">MINIMAL</button>
    <button type="button" data-vibe="classic">CLASSIC</button>
    <button type="button" data-vibe="full">FULL</button>
  </div>

  <label>ACCENT HUE</label>
  <div class="sw-hue-row" id="sw-hue-row">
    <button type="button" data-hue="cyan">CYAN</button>
    <button type="button" data-hue="violet">VIOLET</button>
    <button type="button" data-hue="magenta">MAGENTA</button>
    <button type="button" data-hue="sunset">SUNSET</button>
  </div>

  <label>NEON GLOW · <span id="sw-v-glow">0.85</span></label>
  <input id="sw-s-glow" type="range" min="0" max="1.2" step="0.05" value="0.85"/>

  <label>HORIZON · <span id="sw-v-horizon">0.55</span></label>
  <input id="sw-s-horizon" type="range" min="0.35" max="0.8" step="0.01" value="0.55"/>

  <label>GRID FLOOR · <span id="sw-v-floor">0.7</span></label>
  <input id="sw-s-floor" type="range" min="0" max="1" step="0.05" value="0.7"/>

  <label>SCANLINES · <span id="sw-v-scan">0.30</span></label>
  <input id="sw-s-scan" type="range" min="0" max="0.6" step="0.02" value="0.30"/>

  <p class="sw-tweaks-hint">Press <kbd>`</kbd> to close</p>
</div>

<style>
  #sw-tweaks {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 80;
    width: 280px;
    padding: 18px 18px 14px;
    border: 1px solid rgba(34, 231, 255, 0.5);
    background: linear-gradient(180deg, rgba(20, 8, 50, 0.95), rgba(10, 2, 32, 0.97));
    border-radius: 4px;
    box-shadow:
      0 0 20px rgba(34, 231, 255, 0.4),
      0 0 40px rgba(255, 43, 214, 0.25),
      inset 0 0 0 1px rgba(255, 43, 214, 0.15);
    font-family: var(--font-mono);
    color: var(--sw-white);
    display: none;
    backdrop-filter: blur(6px);
  }
  #sw-tweaks.open { display: block; }
  #sw-tweaks h3 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.3em;
    color: var(--mag-2);
    margin: 0 0 12px;
    text-shadow: 0 0 6px var(--mag);
    display: flex; justify-content: space-between; align-items: center;
  }
  #sw-tweaks label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--cyan-2);
    text-transform: uppercase;
    margin: 10px 0 6px;
  }
  #sw-tweaks input[type="range"] {
    width: 100%;
    accent-color: var(--mag);
  }
  .sw-vibe-row, .sw-hue-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .sw-vibe-row button, .sw-hue-row button {
    flex: 1;
    min-width: 60px;
    background: rgba(10, 2, 32, 0.6);
    color: var(--cyan-2);
    border: 1px solid rgba(34, 231, 255, 0.3);
    padding: 6px 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .sw-vibe-row button.on, .sw-hue-row button.on {
    color: #fff;
    border-color: var(--mag);
    background: rgba(255, 43, 214, 0.18);
    box-shadow: 0 0 8px rgba(255, 43, 214, 0.5);
  }
  .sw-tweaks-hint {
    margin: 12px 0 0;
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--sw-dim);
    text-transform: uppercase;
  }
  .sw-tweaks-hint kbd {
    font-family: var(--font-mono);
    border: 1px solid rgba(34, 231, 255, 0.3);
    padding: 1px 4px;
    border-radius: 2px;
    color: var(--cyan-2);
  }
</style>

<script is:inline>
  (function () {
    const DEFAULTS = {
      vibe: "classic",
      accentHue: "cyan",
      glow: 0.85,
      horizon: 0.55,
      gridFloor: 0.7,
      scan: 0.30,
    };
    const STORAGE_KEY = "dvflw.tweaks";
    const HUES = {
      cyan:    { mag: "#ff2bd6", mag2: "#ff62e6", cyan: "#22e7ff", cyan2: "#7df4ff", violet: "#8a4cff" },
      violet:  { mag: "#ff2bd6", mag2: "#ff62e6", cyan: "#22e7ff", cyan2: "#7df4ff", violet: "#8a4cff" },
      magenta: { mag: "#ff1f9c", mag2: "#ff6ac4", cyan: "#ff9a4a", cyan2: "#ffc07d", violet: "#ff3672" },
      sunset:  { mag: "#ff6a3d", mag2: "#ff9063", cyan: "#f9d65c", cyan2: "#ffe89c", violet: "#ff4da6" },
    };

    let T = Object.assign({}, DEFAULTS);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") T = Object.assign(T, saved);
    } catch (e) {}

    const root = document.documentElement;
    const panel = document.getElementById("sw-tweaks");
    const scanlines = document.querySelector(".sw-scanlines");
    const stars = document.querySelector(".sw-stars");
    const vignette = document.querySelector(".sw-vignette");
    const mountains = document.querySelector(".sw-mountains");
    const planet = document.querySelector(".sw-planet");

    function applyAll() {
      root.style.setProperty("--glow", String(T.glow));
      root.style.setProperty("--horizon", String(T.horizon));
      root.style.setProperty("--floor-opacity", String(T.gridFloor));
      root.style.setProperty("--scan-alpha", String(T.scan));

      const h = HUES[T.accentHue] || HUES.cyan;
      root.style.setProperty("--mag", h.mag);
      root.style.setProperty("--mag-2", h.mag2);
      root.style.setProperty("--cyan", h.cyan);
      root.style.setProperty("--cyan-2", h.cyan2);
      root.style.setProperty("--violet", h.violet);

      if (scanlines) scanlines.style.display = (T.vibe === "minimal") ? "none" : "";
      if (stars) stars.style.display = (T.vibe === "minimal") ? "none" : "";
      if (vignette) vignette.style.opacity = (T.vibe === "minimal") ? "0.4" : "1";
      if (mountains) mountains.style.display = (T.vibe === "minimal") ? "none" : "";
      if (planet) planet.style.display = (T.vibe === "full") ? "" : "none";

      document.getElementById("sw-v-glow").textContent = Number(T.glow).toFixed(2);
      document.getElementById("sw-v-horizon").textContent = Number(T.horizon).toFixed(2);
      document.getElementById("sw-v-floor").textContent = Number(T.gridFloor).toFixed(2);
      document.getElementById("sw-v-scan").textContent = Number(T.scan).toFixed(2);
      document.getElementById("sw-s-glow").value = T.glow;
      document.getElementById("sw-s-horizon").value = T.horizon;
      document.getElementById("sw-s-floor").value = T.gridFloor;
      document.getElementById("sw-s-scan").value = T.scan;
      document.querySelectorAll("#sw-vibe-row button").forEach((b) =>
        b.classList.toggle("on", b.dataset.vibe === T.vibe));
      document.querySelectorAll("#sw-hue-row button").forEach((b) =>
        b.classList.toggle("on", b.dataset.hue === T.accentHue));
    }

    function save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(T)); } catch (e) {}
    }

    function set(key, val) {
      T[key] = val;
      applyAll();
      save();
    }

    applyAll();

    document.querySelectorAll("#sw-vibe-row button").forEach((b) =>
      b.addEventListener("click", () => set("vibe", b.dataset.vibe)));
    document.querySelectorAll("#sw-hue-row button").forEach((b) =>
      b.addEventListener("click", () => set("accentHue", b.dataset.hue)));
    document.getElementById("sw-s-glow").addEventListener("input", (e) => set("glow", parseFloat(e.target.value)));
    document.getElementById("sw-s-horizon").addEventListener("input", (e) => set("horizon", parseFloat(e.target.value)));
    document.getElementById("sw-s-floor").addEventListener("input", (e) => set("gridFloor", parseFloat(e.target.value)));
    document.getElementById("sw-s-scan").addEventListener("input", (e) => set("scan", parseFloat(e.target.value)));

    // Toggle on backtick (ignore while typing in inputs)
    document.addEventListener("keydown", (e) => {
      if (e.key !== "`") return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      panel.classList.toggle("open");
    });
  })();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tweaks-panel.astro
git commit -m "feat: add tweaks panel with backtick toggle"
```

---

## Task 9: Player card component

Player 1 ID card with pixel portrait placeholder + stat rows. Used on home (size=hero) and about (size=about).

**Files:**
- Create: `src/components/player-card.astro`

- [ ] **Step 1: Create `src/components/player-card.astro`**

```astro
---
interface Row {
  k: string;
  v: string;
}

interface Props {
  size?: "hero" | "about";
  rows?: Row[];
}

const defaultRows: Row[] = [
  { k: "TITLE", v: "ENG MGR" },
  { k: "LOCATION", v: "WEST MICHIGAN" },
  { k: "CLASS", v: "BUILDER / WRITER" },
  { k: "CURRENT BUILD", v: "MANTLE // HONEYDEW" },
];

const { size = "hero", rows = defaultRows } = Astro.props;
---
<div class:list={["sw-id-card", `sw-id-${size}`]}>
  <div class="sw-id-photo" aria-hidden="true"></div>
  <dl class="sw-id-rows">
    {rows.map((row) => (
      <div class="sw-id-row">
        <dt class="k">{row.k}</dt>
        <dd class="v">{row.v}</dd>
      </div>
    ))}
  </dl>
</div>

<style>
  .sw-id-card {
    padding: 20px;
    border: 1px solid rgba(34, 231, 255, 0.3);
    background: linear-gradient(180deg, rgba(20, 8, 50, 0.7), rgba(10, 2, 32, 0.9));
    border-radius: 4px;
    position: relative;
  }
  .sw-id-card::before {
    content: "PLAYER 1";
    position: absolute; top: -8px; left: 12px;
    background: var(--sw-bg-0);
    padding: 0 8px;
    font-family: var(--font-display);
    font-size: 10px;
    color: var(--mag-2);
    letter-spacing: 0.3em;
    text-shadow: 0 0 6px var(--mag);
  }
  .sw-id-photo {
    width: 100%; aspect-ratio: 1/1;
    border-radius: 3px;
    background: linear-gradient(135deg, #241050, #3d0a6b 40%, #8a1fa0 100%);
    position: relative;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .sw-id-photo::before {
    content: "";
    position: absolute; inset: 0;
    background: repeating-linear-gradient(0deg,
      transparent 0, transparent 5px,
      rgba(34, 231, 255, 0.07) 5px, rgba(34, 231, 255, 0.07) 6px);
  }
  .sw-id-photo::after {
    content: "[ PORTRAIT ]";
    position: absolute; inset: 0;
    display: grid; place-items: center;
    font-family: var(--font-pixel);
    color: var(--cyan-2);
    font-size: 20px;
    letter-spacing: 0.3em;
    opacity: 0.6;
  }
  .sw-id-rows { margin: 0; padding: 0; }
  .sw-id-row {
    display: flex; justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px dashed rgba(34, 231, 255, 0.2);
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .sw-id-row:last-child { border-bottom: none; }
  .sw-id-row .k {
    color: var(--sw-dim);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin: 0;
  }
  .sw-id-row .v {
    color: var(--cyan-2);
    margin: 0;
  }

  .sw-id-hero { max-width: 360px; margin: 0 auto; }
  .sw-id-about { max-width: 100%; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/player-card.astro
git commit -m "feat: add Player 1 ID card component"
```

---

## Task 10: Rewrite base-layout.astro shell

Wire up backdrop, scanlines, vignette, scroll indicator, tweaks panel, synthwave header (brand + nav + sysbar), styled footer. Preserve existing Konami easter egg JS.

**Files:**
- Modify: `src/layouts/base-layout.astro` (full rewrite)

- [ ] **Step 1: Read the current file to preserve the Konami block**

Run: `cat src/layouts/base-layout.astro` — note the `<script>` block from line ~70 onward (Konami code that grants "30 extra lives"). It must be preserved as-is, but retargeted to use `--color-accent` or `--mag` as needed.

- [ ] **Step 2: Replace the entire file with:**

```astro
---
import "@/styles/global.css";
import Backdrop from "@/components/backdrop.astro";
import Scanlines from "@/components/scanlines.astro";
import Vignette from "@/components/vignette.astro";
import Brand from "@/components/brand.astro";
import Sysbar from "@/components/sysbar.astro";
import ScrollIndicator from "@/components/scroll-indicator.astro";
import TweaksPanel from "@/components/tweaks-panel.astro";

interface Props {
  title: string;
  description?: string;
  reading?: boolean;
}

const { title, description = "Engineering manager, builder, writer.", reading = false } = Astro.props;
const currentPath = Astro.url.pathname;

const navLinks = [
  { href: "/", label: "HOME", mobileHidden: true },
  { href: "/blog", label: "BLOG" },
  { href: "/case-studies", label: "CASE STUDIES" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/about", label: "ABOUT" },
];
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={Astro.url.href} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=VT323&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="canonical" href={Astro.url.href} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>{title}</title>
  </head>
  <body data-reading={reading ? "true" : undefined}>
    <Backdrop />
    <Vignette />
    <Scanlines />
    <ScrollIndicator />

    <div class="sw-shell">
      <header class="sw-top">
        <Brand />
        <nav class="sw-nav">
          {navLinks.map(({ href, label, mobileHidden }) => (
            <a
              href={href}
              class:list={[
                "sw-nav-link",
                mobileHidden && "sw-nav-link--mobile-hide",
                currentPath === href || (href !== "/" && currentPath.startsWith(href + "/"))
                  ? "active"
                  : "",
              ]}
            >
              {label}
            </a>
          ))}
        </nav>
        <Sysbar />
      </header>

      <main class="sw-page page active">
        <slot />
      </main>

      <footer class="sw-bottom">
        <span>© 2026 MICHAEL McNEES · ALL RIGHTS RESERVED</span>
        <div class="sw-bottom-right">
          <a href="mailto:mcnees.michael@gmail.com">EMAIL</a>
          <a href="https://github.com/michaelmcnees" target="_blank" rel="noopener">GITHUB</a>
          <a href="https://gitlab.com/mmcnees" target="_blank" rel="noopener">GITLAB</a>
          <span class="sw-bottom-status">● SYSTEM ONLINE</span>
        </div>
      </footer>
    </div>

    <TweaksPanel />

    <style>
      .sw-shell {
        position: relative;
        max-width: 1180px;
        width: 100%;
        margin: 0 auto;
        padding: 28px 32px 32px;
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .sw-page { flex: 1 0 auto; }
      .sw-bottom { flex-shrink: 0; margin-top: auto; }

      .sw-top {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 24px;
        padding: 16px 20px;
        border: 1px solid rgba(34, 231, 255, 0.35);
        border-radius: 4px;
        background: linear-gradient(180deg, rgba(20, 8, 50, 0.7), rgba(10, 2, 32, 0.85));
        backdrop-filter: blur(6px);
        box-shadow:
          inset 0 0 0 1px rgba(255, 43, 214, 0.15),
          0 0 20px rgba(34, 231, 255, calc(0.25 * var(--glow))),
          0 0 40px rgba(255, 43, 214, calc(0.18 * var(--glow)));
      }

      .sw-nav {
        display: flex;
        gap: 6px;
        justify-self: center;
        flex-wrap: wrap;
        justify-content: center;
      }
      .sw-nav-link {
        font-family: var(--font-display);
        font-size: 11px;
        letter-spacing: 0.24em;
        font-weight: 600;
        color: var(--sw-white);
        text-decoration: none;
        padding: 10px 14px;
        border: 1px solid transparent;
        border-radius: 3px;
        position: relative;
        transition: all 0.18s ease;
        cursor: pointer;
      }
      .sw-nav-link:hover {
        color: var(--cyan-2);
        text-shadow: 0 0 6px rgba(34, 231, 255, 0.9);
        box-shadow: inset 0 0 0 1px rgba(34, 231, 255, 0.8), 0 0 10px rgba(34, 231, 255, 0.5);
      }
      .sw-nav-link.active {
        color: var(--mag-2);
        text-shadow: 0 0 8px rgba(255, 43, 214, 0.9);
        box-shadow: inset 0 0 0 1px rgba(255, 43, 214, 0.8), 0 0 10px rgba(255, 43, 214, 0.55);
      }

      .sw-bottom {
        margin-top: 80px;
        padding: 24px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(34, 231, 255, 0.2);
        font-family: var(--font-mono);
        font-size: 11px;
        color: var(--sw-dim);
        letter-spacing: 0.12em;
      }
      .sw-bottom-right { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
      .sw-bottom a { color: var(--cyan-2); text-decoration: none; }
      .sw-bottom a:hover { color: var(--mag-2); }
      .sw-bottom-status { color: #6bff9e; }

      /* Responsive: stack nav below brand on mobile */
      @media (max-width: 880px) {
        .sw-top {
          grid-template-columns: 1fr;
          justify-items: center;
          gap: 12px;
        }
        .sw-nav {
          width: 100%;
          overflow-x: auto;
          white-space: nowrap;
          flex-wrap: nowrap;
          justify-content: center;
        }
        .sw-nav-link--mobile-hide { display: none; }
        .sw-bottom { flex-direction: column; gap: 10px; text-align: center; }
      }
    </style>

    <script is:inline>
      // Konami easter egg (preserved from original site).
      if (typeof window !== "undefined") {
        requestIdleCallback(() => {
          const code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
          let pos = 0;
          document.addEventListener("keydown", (e) => {
            if (e.keyCode === code[pos]) {
              pos++;
              if (pos === code.length) {
                pos = 0;
                const overlay = document.createElement("div");
                Object.assign(overlay.style, {
                  position: "fixed", inset: "0", zIndex: "9999",
                  pointerEvents: "none", opacity: "0",
                  background: "repeating-linear-gradient(to bottom, transparent 0 2px, oklch(0 0 0 / 0.08) 2px 4px)",
                });
                document.body.appendChild(overlay);
                overlay.animate([
                  { opacity: 0 }, { opacity: 0.15, offset: 0.3 }, { opacity: 0 },
                ], { duration: 2000 }).onfinish = () => overlay.remove();

                const toast = document.createElement("div");
                toast.textContent = "↑↑↓↓←→←→BA · 30 extra lives granted";
                Object.assign(toast.style, {
                  position: "fixed", bottom: "2rem", left: "50%",
                  transform: "translateX(-50%) translateY(1rem)",
                  fontFamily: "var(--font-mono)", fontSize: "0.875rem",
                  color: "var(--mag-2)", padding: "0.5rem 1rem",
                  border: "1px solid var(--mag)",
                  borderRadius: "0.5rem", background: "rgba(10,2,32,0.95)",
                  zIndex: "10000", opacity: "0", whiteSpace: "nowrap",
                  boxShadow: "0 0 14px rgba(255,43,214,0.8)",
                });
                document.body.appendChild(toast);
                toast.animate([
                  { opacity: 0, transform: "translateX(-50%) translateY(1rem)" },
                  { opacity: 1, transform: "translateX(-50%) translateY(0)", offset: 0.15 },
                  { opacity: 1, transform: "translateX(-50%) translateY(0)", offset: 0.7 },
                  { opacity: 0, transform: "translateX(-50%) translateY(-0.5rem)" },
                ], { duration: 3000 }).onfinish = () => toast.remove();
              }
            } else {
              pos = e.keyCode === code[0] ? 1 : 0;
            }
          });
        });
      }
    </script>
  </body>
</html>
```

- [ ] **Step 3: Build**

Run: `bun run build`
Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/base-layout.astro
git commit -m "feat: rewrite base layout with synthwave shell"
```

---

## Task 11: Home page

Hero panel + Player 1 card + latest-posts panel + projects-preview grid.

**Files:**
- Modify: `src/pages/index.astro` (full rewrite)

- [ ] **Step 1: Replace `src/pages/index.astro` with:**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import Panel from "@/components/panel.astro";
import PlayerCard from "@/components/player-card.astro";
import PostList from "@/components/post-list.astro";

const posts = await getCollection("blog", ({ data }) => !data.draft);
---
<BaseLayout title="Michael McNees // NEON.SYS">
  <Panel title="// NODE_01 :: IDENTITY" sub="INSERT COIN ⟶" class="sw-hero">
    <div class="sw-hero-grid">
      <div>
        <div class="sw-hero-tagline">Player Profile · West Michigan, USA</div>
        <h1 class="sw-hero-title">
          Michael<br />McNees
          <span class="sub">Engineering Manager</span>
        </h1>
        <p class="sw-hero-bio">
          I lead engineering teams and tinker with TypeScript, React, Go, and whatever else
          catches my attention. Currently shipping platform migrations by day, building
          side-quests by night — mostly from a homelab somewhere north of the 43rd parallel.
        </p>
        <div class="sw-hero-ctas">
          <a class="btn primary" href="mailto:mcnees.michael@gmail.com">
            <span>Get in touch</span><span class="arrow">▷</span>
          </a>
          <a class="btn ghost" href="https://github.com/michaelmcnees" target="_blank" rel="noopener">
            <span>GitHub</span><span class="arrow">▷</span>
          </a>
        </div>
      </div>
      <div class="sw-hero-right">
        <PlayerCard size="hero" />
      </div>
    </div>
  </Panel>

  <div class="section-head">
    <h2>Latest Transmissions <span class="meta">// /blog</span></h2>
    <a class="right" href="/blog">View all ▷</a>
  </div>

  <Panel>
    <PostList posts={posts} limit={5} />
  </Panel>
</BaseLayout>

<style>
  .sw-hero { padding: 64px 48px 56px; margin-top: 24px; }
  .sw-hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .sw-hero-tagline {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--cyan-2);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-bottom: 22px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .sw-hero-tagline::before {
    content: "";
    width: 24px; height: 1px;
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
  }
  .sw-hero-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(40px, 6vw, 72px);
    line-height: 0.98;
    letter-spacing: 0.01em;
    margin: 0 0 24px;
    background: linear-gradient(180deg, #fff 0%, #fff 45%, #ff62e6 70%, #b03cff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 12px rgba(255, 43, 214, calc(0.55 * var(--glow))))
            drop-shadow(0 0 2px rgba(34, 231, 255, 0.6));
    text-transform: uppercase;
  }
  .sw-hero-title .sub {
    display: block;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(14px, 1.4vw, 18px);
    letter-spacing: 0.6em;
    color: var(--cyan-2);
    background: none;
    -webkit-text-fill-color: var(--cyan-2);
    margin-top: 14px;
    filter: drop-shadow(0 0 4px rgba(34, 231, 255, 0.8));
  }
  .sw-hero-bio {
    font-size: 16px;
    line-height: 1.65;
    color: #cbc1e8;
    max-width: 500px;
    margin: 0 0 32px;
  }
  .sw-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
  @media (max-width: 880px) {
    .sw-hero { padding: 48px 24px 40px; }
    .sw-hero-grid { grid-template-columns: 1fr; gap: 32px; }
    .sw-hero-right { order: -1; }
  }
</style>
```

- [ ] **Step 2: Build + verify**

Run: `bun run build`
Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: rebuild home page with synthwave hero + Player 1 card"
```

---

## Task 12: Restyle PostList + PostMeta

Convert post-list to synthwave `.sw-post` row pattern (mono date, Orbitron title, desc, tags). Update PostMeta for mono uppercase labels and neon chips.

**Files:**
- Modify: `src/components/post-list.astro`
- Modify: `src/components/post-meta.astro`

- [ ] **Step 1: Replace `src/components/post-list.astro` with:**

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
<div class="sw-post-list">
  {sorted.map((post) => {
    const d = post.data.date;
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
    return (
      <a class="sw-post" href={`/blog/${post.id}`}>
        <span class="sw-post-date">{formatted}</span>
        <div>
          <h3 class="sw-post-title">{post.data.title}</h3>
          <p class="sw-post-desc">{post.data.description}</p>
        </div>
        <div class="sw-post-tags">
          {post.data.tags.slice(0, 2).map((tag) => (
            <span class="sw-tag">{tag.toUpperCase()}</span>
          ))}
        </div>
      </a>
    );
  })}
</div>

<style>
  .sw-post-list { display: grid; grid-template-columns: 1fr; gap: 0; }
  .sw-post {
    display: grid;
    grid-template-columns: 120px 1fr auto;
    align-items: center;
    gap: 28px;
    padding: 22px 24px;
    border-top: 1px solid rgba(34, 231, 255, 0.12);
    text-decoration: none;
    color: var(--sw-white);
    transition: background 0.18s, transform 0.18s;
    position: relative;
  }
  .sw-post:first-child { border-top: 1px solid rgba(34, 231, 255, 0.28); }
  .sw-post:hover {
    background: linear-gradient(90deg, rgba(255, 43, 214, 0.08), rgba(34, 231, 255, 0.05));
  }
  .sw-post:hover .sw-post-title {
    color: var(--mag-2);
    text-shadow: 0 0 10px rgba(255, 43, 214, 0.8);
  }
  .sw-post:hover::before {
    content: "";
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--mag);
    box-shadow: 0 0 10px var(--mag);
  }
  .sw-post-date {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--cyan-2);
    letter-spacing: 0.12em;
  }
  .sw-post-title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin: 0 0 4px;
    color: var(--sw-white);
    transition: color 0.18s;
  }
  .sw-post-desc {
    font-size: 13.5px;
    color: #bcb0d8;
    margin: 0;
    line-height: 1.5;
  }
  .sw-post-tags { display: flex; gap: 6px; }
  .sw-tag {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.2em;
    color: var(--cyan-2);
    border: 1px solid rgba(34, 231, 255, 0.45);
    padding: 3px 8px;
    text-transform: uppercase;
    border-radius: 2px;
    background: rgba(34, 231, 255, 0.06);
  }
  @media (max-width: 880px) {
    .sw-post { grid-template-columns: 1fr; gap: 6px; }
    .sw-post-date { font-size: 10px; }
  }
</style>
```

- [ ] **Step 2: Replace `src/components/post-meta.astro` content with synthwave treatment**

Read the current file: `cat src/components/post-meta.astro`. Preserve the `Props` interface, the `is:inline` views script at the bottom, and the overall field set (date, updated, tags, minutesRead, slug). Replace the rendered markup + CSS with:

```astro
---
import { hashToHue } from "@/utils/tag-color";

interface Props {
  date: Date;
  updated?: Date;
  tags: string[];
  minutesRead?: number;
  slug?: string;
}

const { date, updated, tags, minutesRead, slug } = Astro.props;

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
---
<div class="sw-post-meta">
  <span class="sw-pm-date">{fmt(date)}</span>
  {updated && <span class="sw-pm-updated">· UPDATED {fmt(updated)}</span>}
  {slug && <span id="view-count" class="sw-pm-views" data-views={slug}>· <span data-views-number></span></span>}
  {minutesRead && <span class="sw-pm-read">· {minutesRead} MIN READ</span>}
</div>
{tags.length > 0 && (
  <div class="sw-pm-tags">
    {tags.map((tag) => {
      const hue = hashToHue(tag);
      return (
        <a
          href={`/blog?tag=${tag}`}
          class="sw-pm-tag"
          style={`border-color: oklch(0.72 0.15 ${hue}); color: oklch(0.85 0.15 ${hue});`}
        >
          {tag.toUpperCase()}
        </a>
      );
    })}
  </div>
)}

<style>
  .sw-post-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--cyan-2);
    letter-spacing: 0.14em;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  .sw-pm-date { color: var(--mag-2); text-shadow: 0 0 6px rgba(255, 43, 214, 0.6); }
  .sw-pm-updated, .sw-pm-views, .sw-pm-read { color: var(--sw-dim); }

  .sw-pm-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
    margin-bottom: 16px;
  }
  .sw-pm-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    padding: 4px 10px;
    border: 1px solid;
    border-radius: 2px;
    text-decoration: none;
    background: rgba(10, 2, 32, 0.5);
    text-transform: uppercase;
    transition: box-shadow 0.18s;
  }
  .sw-pm-tag:hover { box-shadow: 0 0 8px currentColor; }
</style>

{slug && (
  <script is:inline>
    (function() {
      var el = document.querySelector("[data-views]");
      if (!el) return;
      var slug = el.dataset.views;
      fetch("/api/views/" + slug, { method: "POST" })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var num = el.querySelector("[data-views-number]");
          if (num && data && data.count) {
            num.textContent = data.count + " VIEWS";
            el.classList.remove("hidden");
          }
        })
        .catch(function() {});
    })();
  </script>
)}
```

- [ ] **Step 3: Build + commit**

```bash
bun run build
git add src/components/post-list.astro src/components/post-meta.astro
git commit -m "feat: restyle post list + meta for synthwave"
```

---

## Task 13: Blog index + search + tag filter

Wrap `/blog` in a panel, restyle Search and TagFilter React components.

**Files:**
- Modify: `src/pages/blog/index.astro`
- Modify: `src/components/search.tsx`
- Modify: `src/components/tag-filter.tsx`

- [ ] **Step 1: Read current files to preserve props + behavior**

Run: `cat src/pages/blog/index.astro src/components/search.tsx src/components/tag-filter.tsx`. Note the client:load hydration, current props, result rendering. Only CSS/markup changes — no API changes.

- [ ] **Step 2: Update `src/pages/blog/index.astro`**

Wrap content in a Panel (`// NODE_02 :: ARCHIVE`), add Orbitron h1 + tagline. Preserve existing `<Search>` and `<TagFilter>` usage unchanged in behavior.

The exact markup depends on the existing file. If the existing structure is:

```astro
<BaseLayout title="Blog — Michael McNees">
  <section>
    <h1>Blog</h1>
    <Search client:load posts={posts} />
    <TagFilter client:load tags={tags} />
    <PostList posts={posts} />
  </section>
</BaseLayout>
```

Replace with:

```astro
<BaseLayout title="Blog // ARCHIVE — Michael McNees">
  <Panel title="// NODE_02 :: ARCHIVE" sub="TRANSMISSION LOG">
    <div class="sw-blog-top">
      <h1 class="sw-blog-title">Archive</h1>
      <p class="sw-blog-sub">Transmissions on engineering, management, homelab, and the side-quests in between.</p>
      <Search client:load posts={posts} />
      <TagFilter client:load tags={tags} />
    </div>
    <PostList posts={posts} />
  </Panel>
</BaseLayout>

<style>
  .sw-blog-top { padding: 36px 32px 28px; }
  .sw-blog-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 44px;
    margin: 0 0 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #fff;
    text-shadow: 0 0 10px rgba(34, 231, 255, 0.7);
  }
  .sw-blog-sub { color: #c8bce4; font-size: 15px; margin: 0 0 22px; }
</style>
```

Add `import Panel from "@/components/panel.astro";` at the top. Keep existing imports for Search, TagFilter, PostList.

- [ ] **Step 3: Update Search component styling**

Modify `src/components/search.tsx` — only adjust the JSX classNames and any inline CSS-in-JS. Keep all state, effects, and Pagefind integration identical. Target: input looks like design lines 1123-1144.

Append this to the component's rendered input element (or an appropriate wrapper):

```tsx
className="sw-search-input"
```

Add this as a sibling `<style>` tag (via a CSS file import) or in the existing styling approach. If the component has no CSS file, create `src/components/search.module.css` and import it. The target CSS:

```css
.sw-search-input {
  background: rgba(10, 2, 32, 0.8);
  border: 1px solid rgba(34, 231, 255, 0.35);
  color: var(--sw-white);
  padding: 12px 14px 12px 36px;
  font-family: var(--font-mono);
  font-size: 13px;
  border-radius: 3px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.sw-search-input::placeholder {
  color: var(--sw-dim);
  letter-spacing: 0.12em;
}
.sw-search-input:focus {
  border-color: var(--mag);
  box-shadow: 0 0 10px rgba(255, 43, 214, 0.5);
}
```

If the existing Search component renders results, apply `.sw-post-list` and `.sw-post` class patterns from Task 12 for consistency.

- [ ] **Step 4: Update TagFilter component styling**

Modify `src/components/tag-filter.tsx` — adjust chip classes. Target `.tagbtn` / `.tagbtn.on` style from design lines 1145-1168:

Add className `sw-tagbtn` to each tag button, and `sw-tagbtn sw-tagbtn--on` when active. Add CSS via the same approach (module or global):

```css
.sw-tagbtn {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  padding: 5px 10px;
  border: 1px solid rgba(138, 76, 255, 0.45);
  color: #c7bae4;
  background: rgba(138, 76, 255, 0.08);
  border-radius: 2px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.15s;
}
.sw-tagbtn:hover {
  color: var(--cyan-2);
  border-color: var(--cyan);
  box-shadow: 0 0 8px rgba(34, 231, 255, 0.4);
}
.sw-tagbtn--on {
  color: #fff;
  border-color: var(--mag);
  background: rgba(255, 43, 214, 0.18);
  box-shadow: 0 0 10px rgba(255, 43, 214, 0.5);
}
```

- [ ] **Step 5: Build + commit**

```bash
bun run build
git add src/pages/blog/index.astro src/components/search.tsx src/components/tag-filter.tsx src/components/*.module.css
git commit -m "feat: restyle blog index, search, tag filter"
```

---

## Task 14: Blog detail page — reading mode

Set `reading={true}` on BaseLayout. Wrap article in a Panel. Restyle prose.

**Files:**
- Modify: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Rewrite `src/pages/blog/[slug].astro`**

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import Panel from "@/components/panel.astro";
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

const wordCount = post.body?.split(/\s+/).length ?? 0;
const minutesRead = Math.max(1, Math.ceil(wordCount / 200));
---
<BaseLayout
  title={`${post.data.title} — Michael McNees`}
  description={post.data.description}
  reading={true}
>
  <Panel title="// TRANSMISSION" sub={`MIN READ ${minutesRead}`}>
    <article class="sw-article" data-pagefind-body>
      <header class="sw-article-header">
        <h1 class="sw-article-title">{post.data.title}</h1>
        <PostMeta
          date={post.data.date}
          updated={post.data.updated}
          tags={post.data.tags}
          minutesRead={minutesRead}
          slug={post.id}
        />
      </header>
      <div class="sw-prose">
        <Content />
      </div>
    </article>
  </Panel>
</BaseLayout>

<style>
  .sw-article { padding: 36px 32px; }
  .sw-article-header { margin-bottom: 32px; }
  .sw-article-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(28px, 4vw, 42px);
    letter-spacing: 0.02em;
    text-transform: uppercase;
    margin: 0 0 18px;
    background: linear-gradient(180deg, #fff 40%, #ff62e6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 8px rgba(255, 43, 214, 0.5));
    line-height: 1.1;
  }
  .sw-prose {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.75;
    color: #cfc3ec;
  }
  .sw-prose :global(h2) {
    font-family: var(--font-display);
    font-size: 22px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--cyan-2);
    text-shadow: 0 0 6px rgba(34, 231, 255, 0.5);
    margin: 48px 0 16px;
  }
  .sw-prose :global(h3) {
    font-family: var(--font-display);
    font-size: 17px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mag-2);
    margin: 32px 0 12px;
  }
  .sw-prose :global(a) {
    color: var(--cyan-2);
    text-decoration: underline;
    text-decoration-color: rgba(34, 231, 255, 0.4);
    text-underline-offset: 3px;
  }
  .sw-prose :global(a:hover) {
    color: var(--mag-2);
    text-decoration-color: var(--mag);
  }
  .sw-prose :global(code) {
    font-family: var(--font-mono);
    background: rgba(34, 231, 255, 0.08);
    border: 1px solid rgba(34, 231, 255, 0.25);
    padding: 1px 6px;
    border-radius: 2px;
    font-size: 0.9em;
  }
  .sw-prose :global(pre) {
    font-family: var(--font-mono);
    background: rgba(10, 2, 32, 0.8);
    border: 1px solid rgba(34, 231, 255, 0.25);
    border-radius: 3px;
    padding: 16px;
    overflow-x: auto;
    box-shadow: inset 0 0 12px rgba(34, 231, 255, 0.08);
  }
  .sw-prose :global(pre code) {
    background: none;
    border: none;
    padding: 0;
  }
  .sw-prose :global(blockquote) {
    border-left: 3px solid var(--mag);
    box-shadow: -8px 0 14px -10px rgba(255, 43, 214, 0.7);
    padding-left: 20px;
    margin: 24px 0;
    color: #c0b4dc;
    font-style: italic;
  }
  .sw-prose :global(ul), .sw-prose :global(ol) { padding-left: 24px; }
  .sw-prose :global(img) { border: 1px solid rgba(34, 231, 255, 0.2); border-radius: 3px; }
  .sw-prose :global(hr) {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--cyan), var(--mag), transparent);
    margin: 40px 0;
  }
</style>
```

- [ ] **Step 2: Build + commit**

```bash
bun run build
git add src/pages/blog/[slug].astro
git commit -m "feat: restyle blog detail with reading mode and synthwave prose"
```

---

## Task 15: Case study card + index

**Files:**
- Modify: `src/components/case-study-card.astro`
- Modify: `src/pages/case-studies/index.astro`

- [ ] **Step 1: Replace `src/components/case-study-card.astro`**

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  entry: CollectionEntry<"case-studies">;
}

const { entry } = Astro.props;
---
<a href={`/case-studies/${entry.id}`} class="sw-cs-card">
  <div class="sw-cs-head">
    <h3 class="sw-cs-title">{entry.data.title}</h3>
    <span class="sw-cs-timeframe">{entry.data.timeframe}</span>
  </div>
  <p class="sw-cs-summary">{entry.data.summary}</p>
  <div class="sw-cs-role">{entry.data.role}</div>
</a>

<style>
  .sw-cs-card {
    display: block;
    padding: 26px 28px;
    border-top: 1px solid rgba(34, 231, 255, 0.12);
    text-decoration: none;
    color: var(--sw-white);
    transition: background 0.18s, transform 0.18s;
    position: relative;
  }
  .sw-cs-card:first-child { border-top: 1px solid rgba(34, 231, 255, 0.28); }
  .sw-cs-card:hover {
    background: linear-gradient(90deg, rgba(255, 43, 214, 0.08), rgba(34, 231, 255, 0.05));
    transform: translateX(2px);
  }
  .sw-cs-card:hover::before {
    content: "";
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--mag);
    box-shadow: 0 0 10px var(--mag);
  }
  .sw-cs-card:hover .sw-cs-title {
    color: var(--mag-2);
    text-shadow: 0 0 10px rgba(255, 43, 214, 0.8);
  }
  .sw-cs-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 6px;
  }
  .sw-cs-title {
    font-family: var(--font-display);
    font-size: 18px;
    letter-spacing: 0.04em;
    font-weight: 700;
    text-transform: uppercase;
    margin: 0;
    transition: color 0.18s;
  }
  .sw-cs-timeframe {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--cyan-2);
    text-transform: uppercase;
  }
  .sw-cs-summary {
    font-size: 14px;
    color: #bcb0d8;
    line-height: 1.55;
    margin: 0 0 8px;
  }
  .sw-cs-role {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--sw-dim);
    text-transform: uppercase;
  }
</style>
```

- [ ] **Step 2: Update `src/pages/case-studies/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import Panel from "@/components/panel.astro";
import CaseStudyCard from "@/components/case-study-card.astro";

const entries = await getCollection("case-studies", ({ data }) => !data.draft);
const sorted = entries.sort((a, b) => {
  const orderDelta = (a.data.order ?? Infinity) - (b.data.order ?? Infinity);
  if (orderDelta !== 0) return orderDelta;
  return b.data.date.getTime() - a.data.date.getTime();
});
---
<BaseLayout title="Case Studies // DOSSIERS — Michael McNees" description="Long-form write-ups of client and community work.">
  <Panel title="// NODE_03 :: DOSSIERS" sub="MISSION ARCHIVE">
    <div class="sw-cs-top">
      <h1 class="sw-cs-page-title">Dossiers</h1>
      <p class="sw-cs-page-sub">Longer write-ups of work I've done for clients, communities, and friends.</p>
    </div>
    {sorted.length === 0 ? (
      <p class="sw-empty">No dossiers yet.</p>
    ) : (
      sorted.map((entry) => <CaseStudyCard entry={entry} />)
    )}
  </Panel>
</BaseLayout>

<style>
  .sw-cs-top { padding: 36px 32px 20px; }
  .sw-cs-page-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 44px;
    margin: 0 0 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #fff;
    text-shadow: 0 0 10px rgba(34, 231, 255, 0.7);
  }
  .sw-cs-page-sub { color: #c8bce4; font-size: 15px; margin: 0 0 12px; }
  .sw-empty { padding: 36px 32px; color: var(--sw-dim); font-family: var(--font-mono); }
</style>
```

- [ ] **Step 3: Build + commit**

```bash
bun run build
git add src/components/case-study-card.astro src/pages/case-studies/index.astro
git commit -m "feat: restyle case studies index and card"
```

---

## Task 16: Case study detail + sidebar

**Files:**
- Modify: `src/components/case-study-sidebar.astro`
- Modify: `src/pages/case-studies/[slug].astro`

- [ ] **Step 1: Replace `src/components/case-study-sidebar.astro`**

```astro
---
interface Props {
  role: string;
  timeframe: string;
  client?: string;
  stack: string[];
  outcome: string;
  url?: string;
  repo?: string;
}

const { role, timeframe, client, stack, outcome, url, repo } = Astro.props;
---
<aside class="sw-dossier">
  <div class="sw-dossier-badge">DOSSIER</div>
  <dl class="sw-dossier-list">
    {client && (
      <div class="sw-dossier-row">
        <dt>CLIENT</dt>
        <dd>{client}</dd>
      </div>
    )}
    <div class="sw-dossier-row">
      <dt>ROLE</dt>
      <dd>{role}</dd>
    </div>
    <div class="sw-dossier-row">
      <dt>TIMEFRAME</dt>
      <dd>{timeframe}</dd>
    </div>
    <div class="sw-dossier-row">
      <dt>OUTCOME</dt>
      <dd>{outcome}</dd>
    </div>
    {stack.length > 0 && (
      <div class="sw-dossier-row sw-dossier-stack">
        <dt>STACK</dt>
        <dd>
          {stack.map((s) => <span class="sw-chip">{s}</span>)}
        </dd>
      </div>
    )}
  </dl>
  {(url || repo) && (
    <div class="sw-dossier-links">
      {url && <a href={url} target="_blank" rel="noopener">VISIT ▷</a>}
      {repo && <a href={repo} target="_blank" rel="noopener">REPO ▷</a>}
    </div>
  )}
</aside>

<style>
  .sw-dossier {
    padding: 20px;
    border: 1px solid rgba(34, 231, 255, 0.3);
    background: linear-gradient(180deg, rgba(20, 8, 50, 0.7), rgba(10, 2, 32, 0.9));
    border-radius: 4px;
    position: sticky;
    top: 20px;
    align-self: start;
  }
  .sw-dossier-badge {
    position: absolute;
    top: -8px; left: 12px;
    background: var(--sw-bg-0);
    padding: 0 8px;
    font-family: var(--font-display);
    font-size: 10px;
    color: var(--mag-2);
    letter-spacing: 0.3em;
    text-shadow: 0 0 6px var(--mag);
  }
  .sw-dossier-list { margin: 0; padding: 0; }
  .sw-dossier-row {
    padding: 10px 0;
    border-bottom: 1px dashed rgba(34, 231, 255, 0.2);
  }
  .sw-dossier-row:last-child { border-bottom: none; }
  .sw-dossier-row dt {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--sw-dim);
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .sw-dossier-row dd {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--cyan-2);
    margin: 0;
    line-height: 1.5;
  }
  .sw-dossier-stack dd {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .sw-chip {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: #d1c6ec;
    padding: 3px 8px 3px 10px;
    background: rgba(138, 76, 255, 0.12);
    border-left: 2px solid var(--violet);
    border-radius: 0 2px 2px 0;
  }
  .sw-dossier-links {
    display: flex;
    gap: 14px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(34, 231, 255, 0.2);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
  }
  .sw-dossier-links a {
    color: var(--cyan-2);
    text-decoration: none;
  }
  .sw-dossier-links a:hover {
    color: var(--mag-2);
    text-shadow: 0 0 6px var(--mag);
  }
</style>
```

- [ ] **Step 2: Rewrite `src/pages/case-studies/[slug].astro`**

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import Panel from "@/components/panel.astro";
import CaseStudySidebar from "@/components/case-study-sidebar.astro";

export async function getStaticPaths() {
  const entries = await getCollection("case-studies", ({ data }) => !data.draft);
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<BaseLayout
  title={`${entry.data.title} — Michael McNees`}
  description={entry.data.summary}
  reading={true}
>
  <Panel title="// DOSSIER" sub={entry.data.client ?? entry.data.title}>
    <div class="sw-cs-detail">
      <header class="sw-cs-header">
        <h1 class="sw-cs-title">{entry.data.title}</h1>
        <p class="sw-cs-summary">{entry.data.summary}</p>
      </header>
      <div class="sw-cs-grid">
        <div class="sw-cs-body sw-prose">
          <Content />
        </div>
        <div class="sw-cs-side">
          <CaseStudySidebar
            role={entry.data.role}
            timeframe={entry.data.timeframe}
            client={entry.data.client}
            stack={entry.data.stack}
            outcome={entry.data.outcome}
            url={entry.data.url}
            repo={entry.data.repo}
          />
        </div>
      </div>
    </div>
  </Panel>
</BaseLayout>

<style>
  .sw-cs-detail { padding: 36px 32px; }
  .sw-cs-header { margin-bottom: 32px; }
  .sw-cs-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(28px, 4vw, 42px);
    letter-spacing: 0.02em;
    text-transform: uppercase;
    margin: 0 0 12px;
    background: linear-gradient(180deg, #fff 40%, #7df4ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 8px rgba(34, 231, 255, 0.5));
    line-height: 1.1;
  }
  .sw-cs-summary { color: #cfc3ec; font-size: 15px; line-height: 1.6; margin: 0; }
  .sw-cs-grid {
    display: grid;
    gap: 40px;
    grid-template-columns: 1fr 280px;
  }
  .sw-cs-body {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.75;
    color: #cfc3ec;
  }
  /* Reuse sw-prose from Task 14 for h2/h3/code/blockquote styling */
  .sw-cs-body :global(h2) {
    font-family: var(--font-display);
    font-size: 22px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--cyan-2);
    text-shadow: 0 0 6px rgba(34, 231, 255, 0.5);
    margin: 48px 0 16px;
  }
  .sw-cs-body :global(h3) {
    font-family: var(--font-display);
    font-size: 17px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mag-2);
    margin: 32px 0 12px;
  }
  .sw-cs-body :global(a) {
    color: var(--cyan-2);
    text-decoration: underline;
    text-decoration-color: rgba(34, 231, 255, 0.4);
    text-underline-offset: 3px;
  }
  .sw-cs-body :global(a:hover) { color: var(--mag-2); }
  .sw-cs-body :global(code) {
    font-family: var(--font-mono);
    background: rgba(34, 231, 255, 0.08);
    border: 1px solid rgba(34, 231, 255, 0.25);
    padding: 1px 6px;
    border-radius: 2px;
    font-size: 0.9em;
  }
  @media (max-width: 880px) {
    .sw-cs-grid { grid-template-columns: 1fr; }
    .sw-cs-side { order: -1; }
    .sw-cs-side .sw-dossier { position: static; }
  }
</style>
```

- [ ] **Step 3: Build + commit**

```bash
bun run build
git add src/components/case-study-sidebar.astro src/pages/case-studies/[slug].astro
git commit -m "feat: restyle case study detail with synthwave dossier sidebar"
```

---

## Task 17: Projects index + cards

**Files:**
- Modify: `src/components/project-card.astro`
- Modify: `src/components/status-badge.astro`
- Modify: `src/components/stack-chip.astro`
- Modify: `src/pages/projects/index.astro`

- [ ] **Step 1: Replace `src/components/status-badge.astro`**

```astro
---
interface Props {
  status: "alpha" | "beta" | "stable";
}

const { status } = Astro.props;
---
<span class:list={["sw-status", `sw-status--${status}`]}>{status}</span>

<style>
  .sw-status {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.28em;
    padding: 3px 8px;
    border-radius: 2px;
    text-transform: uppercase;
    border: 1px solid;
  }
  .sw-status--alpha {
    color: #ff9c3a;
    border-color: #ff9c3a;
    background: rgba(255, 156, 58, 0.08);
    box-shadow: 0 0 8px rgba(255, 156, 58, 0.35);
  }
  .sw-status--beta {
    color: var(--cyan-2);
    border-color: var(--cyan);
    background: rgba(34, 231, 255, 0.08);
    box-shadow: 0 0 8px rgba(34, 231, 255, 0.35);
  }
  .sw-status--stable {
    color: #6bff9e;
    border-color: #6bff9e;
    background: rgba(107, 255, 158, 0.08);
    box-shadow: 0 0 8px rgba(107, 255, 158, 0.35);
  }
</style>
```

- [ ] **Step 2: Replace `src/components/stack-chip.astro`**

```astro
---
interface Props {
  label: string;
}

const { label } = Astro.props;
---
<span class="sw-chip">{label}</span>

<style>
  .sw-chip {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: #d1c6ec;
    padding: 3px 8px 3px 10px;
    background: rgba(138, 76, 255, 0.12);
    border-left: 2px solid var(--violet);
    border-radius: 0 2px 2px 0;
  }
</style>
```

- [ ] **Step 3: Replace `src/components/project-card.astro`**

```astro
---
import type { CollectionEntry } from "astro:content";
import StatusBadge from "@/components/status-badge.astro";
import StackChip from "@/components/stack-chip.astro";

interface Props {
  entry: CollectionEntry<"projects">;
}

const { entry } = Astro.props;
const { name, tagline, status, stack, url, repo } = entry.data;
---
<article class="sw-project">
  <header class="sw-project-head">
    <h3 class="sw-project-name">{name}</h3>
    <StatusBadge status={status} />
  </header>
  <p class="sw-project-tag">{tagline}</p>
  <div class="sw-project-body sw-prose-compact">
    <slot />
  </div>
  {stack.length > 0 && (
    <div class="sw-project-stack">
      {stack.map((s) => <StackChip label={s} />)}
    </div>
  )}
  {(url || repo) && (
    <div class="sw-project-links">
      {url && <a href={url} target="_blank" rel="noopener">VISIT ▷</a>}
      {repo && <a href={repo} target="_blank" rel="noopener">REPO ▷</a>}
    </div>
  )}
</article>

<style>
  .sw-project {
    position: relative;
    padding: 26px 24px 22px;
    border: 1px solid rgba(34, 231, 255, 0.22);
    border-radius: 4px;
    background: linear-gradient(180deg, rgba(20, 8, 50, 0.55), rgba(10, 2, 32, 0.8));
    overflow: hidden;
    transition: border-color 0.18s, transform 0.18s;
  }
  .sw-project::after {
    content: "";
    position: absolute;
    inset: auto 0 0 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--cyan), var(--mag), transparent);
    opacity: 0.4;
    transition: opacity 0.18s;
  }
  .sw-project:hover { border-color: var(--mag); transform: translateY(-2px); }
  .sw-project:hover::after { opacity: 1; }
  .sw-project-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .sw-project-name {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--sw-white);
    text-transform: uppercase;
    text-shadow: 0 0 8px rgba(34, 231, 255, 0.45);
    margin: 0;
  }
  .sw-project-tag {
    font-size: 13.5px;
    color: #c6b9e6;
    line-height: 1.5;
    margin: 0 0 12px;
  }
  .sw-project-body {
    font-size: 13.5px;
    color: #bcb0d8;
    line-height: 1.6;
    margin-bottom: 14px;
  }
  .sw-project-body :global(p) { margin: 0 0 10px; }
  .sw-project-body :global(p:last-child) { margin-bottom: 0; }
  .sw-project-body :global(a) { color: var(--cyan-2); }
  .sw-project-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
  }
  .sw-project-links {
    display: flex;
    gap: 14px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
  }
  .sw-project-links a {
    color: var(--cyan-2);
    text-decoration: none;
  }
  .sw-project-links a:hover {
    color: var(--mag-2);
    text-shadow: 0 0 6px var(--mag);
  }
</style>
```

- [ ] **Step 4: Rewrite `src/pages/projects/index.astro`**

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import Panel from "@/components/panel.astro";
import ProjectCard from "@/components/project-card.astro";

const entries = await getCollection("projects", ({ data }) => !data.draft);
const sorted = entries.sort((a, b) => {
  const orderDelta = (a.data.order ?? Infinity) - (b.data.order ?? Infinity);
  if (orderDelta !== 0) return orderDelta;
  return a.data.name.localeCompare(b.data.name);
});

const rendered = await Promise.all(
  sorted.map(async (entry) => {
    const { Content } = await render(entry);
    return { entry, Content };
  }),
);
---
<BaseLayout title="Projects // BUILDS — Michael McNees" description="Side projects, tools, and experiments.">
  <Panel title="// NODE_04 :: BUILDS" sub="SIDE-QUEST LOG">
    <div class="sw-projects-top">
      <h1 class="sw-projects-title">Builds</h1>
      <p class="sw-projects-sub">Side projects, tools, and experiments — some shipping, some still finding their shape.</p>
    </div>
    <div class="sw-projects-grid">
      {rendered.length === 0 ? (
        <p class="sw-empty">No builds yet.</p>
      ) : (
        rendered.map(({ entry, Content }) => (
          <ProjectCard entry={entry}>
            <Content />
          </ProjectCard>
        ))
      )}
    </div>
  </Panel>
</BaseLayout>

<style>
  .sw-projects-top { padding: 36px 32px 20px; }
  .sw-projects-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 44px;
    margin: 0 0 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: linear-gradient(180deg, #fff 40%, #7df4ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 6px rgba(34, 231, 255, 0.55));
  }
  .sw-projects-sub { color: #c8bce4; font-size: 15px; margin: 0; }
  .sw-projects-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
    padding: 0 32px 36px;
  }
  @media (max-width: 880px) {
    .sw-projects-grid { grid-template-columns: 1fr; padding: 0 20px 32px; }
  }
  .sw-empty { padding: 36px; color: var(--sw-dim); font-family: var(--font-mono); grid-column: 1/-1; }
</style>
```

- [ ] **Step 5: Build + commit**

```bash
bun run build
git add src/components/project-card.astro src/components/status-badge.astro src/components/stack-chip.astro src/pages/projects/index.astro
git commit -m "feat: restyle projects index and cards"
```

---

## Task 18: About page + timeline

**Files:**
- Modify: `src/components/about-timeline.astro`
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Read the current `about-timeline.astro` to preserve its data**

Run: `cat src/components/about-timeline.astro`. Note the timeline entries (period / role / description) and the data they render.

- [ ] **Step 2: Replace `src/components/about-timeline.astro`**

Preserve the data array. Replace the rendering template with:

```astro
---
interface TimelineEntry {
  period: string;
  role: string;
  description: string;
  color?: "mag" | "cyan";
}

// Keep the same data as the current file — re-declare here preserving existing entries.
// If the current file has a different data structure, adapt this declaration to match it.
const entries: TimelineEntry[] = [
  // PRESERVE THE EXISTING ENTRIES FROM THE CURRENT FILE.
  // If the current file has entries in a different shape, port them into this shape.
];
---
<div class="sw-timeline">
  {entries.map((entry) => (
    <div class:list={["sw-tl-item", entry.color === "cyan" && "sw-tl-item--cyan"]}>
      <div class="sw-tl-period">{entry.period}</div>
      <div class="sw-tl-role">{entry.role}</div>
      <p class="sw-tl-desc">{entry.description}</p>
    </div>
  ))}
</div>

<style>
  .sw-timeline { display: grid; gap: 26px; }
  .sw-tl-item {
    position: relative;
    padding-left: 26px;
    border-left: 1px solid rgba(138, 76, 255, 0.35);
  }
  .sw-tl-item::before {
    content: "";
    position: absolute;
    left: -6px;
    top: 3px;
    width: 11px;
    height: 11px;
    background: var(--mag);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--mag), 0 0 18px rgba(255, 43, 214, 0.5);
  }
  .sw-tl-item--cyan::before {
    background: var(--cyan);
    box-shadow: 0 0 10px var(--cyan), 0 0 18px rgba(34, 231, 255, 0.5);
  }
  .sw-tl-period {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.2em;
    color: var(--mag-2);
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .sw-tl-role {
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 0.06em;
    color: var(--sw-white);
    margin: 0 0 6px;
  }
  .sw-tl-desc {
    font-size: 13.5px;
    line-height: 1.6;
    color: #c0b4dc;
    margin: 0;
  }
</style>
```

**IMPORTANT:** Before committing, open the existing `about-timeline.astro` and copy the actual timeline data array into the `entries: TimelineEntry[]` declaration above. Do NOT leave the placeholder comment. If the existing data uses different field names, adapt them.

- [ ] **Step 3: Rewrite `src/pages/about.astro`**

Read current: `cat src/pages/about.astro`. Note the existing bio prose and any content the page renders. Rewrite wrapping it in a Panel + two-column grid with PlayerCard:

```astro
---
import BaseLayout from "@/layouts/base-layout.astro";
import Panel from "@/components/panel.astro";
import PlayerCard from "@/components/player-card.astro";
import AboutTimeline from "@/components/about-timeline.astro";
---
<BaseLayout title="About // OPERATOR — Michael McNees" description="About Michael McNees — engineering manager, builder, writer.">
  <Panel title="// OPERATOR" sub="PLAYER 1 BIO">
    <div class="sw-about-grid">
      <div class="sw-about-main">
        <h1>About</h1>
        <p>
          I'm Michael — an engineering manager, builder, and writer living in West Michigan.
          I lead engineering teams, tinker with TypeScript, React, Go, and whatever else catches
          my attention, and write about what I'm learning along the way.
        </p>
        <!-- PRESERVE ANY ADDITIONAL ABOUT COPY from the current about.astro file here. -->

        <h2>Timeline</h2>
        <AboutTimeline />
      </div>
      <aside class="sw-about-side">
        <PlayerCard
          size="about"
          rows={[
            { k: "TITLE", v: "ENG MGR" },
            { k: "LOCATION", v: "WEST MICHIGAN" },
            { k: "CLASS", v: "BUILDER / WRITER" },
            { k: "STACK", v: "TS · GO · RN" },
            { k: "CURRENT BUILD", v: "MANTLE // HONEYDEW" },
          ]}
        />
      </aside>
    </div>
  </Panel>
</BaseLayout>

<style>
  .sw-about-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 48px;
    padding: 36px 32px;
  }
  .sw-about-main h1 {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 44px;
    margin: 0 0 24px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: linear-gradient(180deg, #fff 40%, #ff62e6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 8px rgba(255, 43, 214, 0.5));
  }
  .sw-about-main p {
    line-height: 1.75;
    color: #cfc3ec;
    font-size: 15.5px;
    margin: 0 0 16px;
  }
  .sw-about-main h2 {
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin: 36px 0 16px;
    color: var(--cyan-2);
    text-shadow: 0 0 6px rgba(34, 231, 255, 0.6);
  }
  .sw-about-side {
    position: sticky;
    top: 20px;
    align-self: start;
  }
  @media (max-width: 880px) {
    .sw-about-grid { grid-template-columns: 1fr; padding: 28px 20px; }
    .sw-about-side { position: static; order: -1; }
  }
</style>
```

**IMPORTANT:** Open the current `src/pages/about.astro` and port any existing bio/biography text into the `<p>` and additional sections of the new file. Do NOT lose existing content. If there are sections beyond "Timeline," add matching `<h2>` headings inside `.sw-about-main`.

- [ ] **Step 4: Build + commit**

```bash
bun run build
git add src/components/about-timeline.astro src/pages/about.astro
git commit -m "feat: restyle about page with Player 1 card and synthwave timeline"
```

---

## Task 19: 404 page

**Files:**
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Replace `src/pages/404.astro`**

```astro
---
import BaseLayout from "@/layouts/base-layout.astro";
import Panel from "@/components/panel.astro";
---
<BaseLayout title="// SIGNAL LOST — Michael McNees" description="Page not found.">
  <Panel title="// SIGNAL LOST" sub="ERR_404">
    <div class="sw-404">
      <pre class="sw-404-ascii">{`
  ▄▀▄   ▄▀▄   █▄▄▄   █▄  █   █▀▀█   █     █▀▀▀█
  █ █   █ █   █▄▄▄   █ ▀▄█   █▄▄█   █     █▄▄▄█
  ▀ ▀   ▀ ▀   ▀▀▀▀   ▀   ▀   ▀  ▀   ▀▀▀▀  ▀▀▀▀▀

   >> transmission lost.
   >> requested coordinates not on this network.
      `}</pre>
      <p class="sw-404-msg">The page you're looking for isn't here. Broken link? Bad save? Either way — return to base.</p>
      <a class="btn primary" href="/"><span>Return to base</span><span class="arrow">▷</span></a>
    </div>
  </Panel>
</BaseLayout>

<style>
  .sw-404 {
    padding: 56px 32px;
    text-align: center;
  }
  .sw-404-ascii {
    font-family: var(--font-mono);
    color: var(--cyan-2);
    font-size: 12px;
    line-height: 1.2;
    margin: 0 auto 32px;
    display: inline-block;
    text-align: left;
    text-shadow: 0 0 8px rgba(34, 231, 255, 0.5);
  }
  .sw-404-msg {
    color: #cfc3ec;
    font-size: 15px;
    max-width: 420px;
    margin: 0 auto 28px;
    line-height: 1.6;
  }
</style>
```

- [ ] **Step 2: Build + commit**

```bash
bun run build
git add src/pages/404.astro
git commit -m "feat: restyle 404 as SIGNAL LOST page"
```

---

## Task 20: End-to-end verification

- [ ] **Step 1: Full build**

Run: `bun run build`
Expected: all pages generate cleanly, no schema / import errors.

- [ ] **Step 2: Preview dev server, visit every route, confirm behavior**

Run: `bun run dev` (or preview via `.claude/launch.json` "dev" config).

Visit each URL and verify:

| URL | What to confirm |
|-----|-----------------|
| `/` | Hero panel + Player 1 card + latest posts. Backdrop animates. |
| `/blog` | Archive panel + search input + tag filter + post rows. Search + tags still filter correctly. |
| `/blog/welcome` (or any existing slug) | Reading mode: backdrop dimmer, grid paused. Orbitron title, prose readable. Views counter fires if the API works. |
| `/case-studies` | Dossiers panel + both cards. |
| `/case-studies/tcb-games` | Reading mode. Narrative + sticky dossier sidebar. Sidebar stacks above on mobile (880px). |
| `/case-studies/creekside-shores-portal` | Same shape as above. |
| `/projects` | Builds panel + 2-column grid. StatusBadges: Mantle = BETA cyan, Honeydew = BETA cyan, Retro Estates = ALPHA orange, homey-vivint = ALPHA orange. |
| `/about` | Operator panel + bio + timeline + Player 1 sidebar. |
| `/404` (navigate to a bad path, e.g., `/nope`) | SIGNAL LOST + Return to base button. |

For every page, also verify:
- Scroll indicator visible right edge, draggable, % updates.
- Pressing backtick opens the Tweaks panel. Change accent hue; verify magenta/cyan update live. Close with backtick.
- Reload after changing accent → new accent persists (localStorage).
- Konami code (↑↑↓↓←→←→BA) still triggers the toast + scanline flash.
- No browser console errors.
- Nav shows Orbitron uppercase labels. Active link is magenta-glowing.
- Mobile (resize to 375px): nav stacks below brand, scrollable, Home hidden.

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Done**

Synthwave redesign shipped.
