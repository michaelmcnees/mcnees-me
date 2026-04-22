# Mobile UX Refinement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Apply every recommendation from the UI Designer audit on 2026-04-22 to eliminate cramping and clutter on phones, refine breakpoints, and tighten rhythm across all routes.

**Architecture:** All changes are CSS-only (no markup/JSX changes except a small grid-area rewrite in base-layout.astro). Most edits land in `src/styles/synthwave.css` — existing page-scoped `<style>` blocks get mobile overrides added inline. Breakpoint refactor to three tiers: ≤640 (phone), 641–880 (large phone / small tablet), ≥881 (desktop).

**Tech Stack:** Astro 5, Tailwind v4, plain CSS.

**Source audit:** Full audit from UI Designer subagent on 2026-04-22. Captured in this plan.

---

## Task 1: Shell + rhythm overrides in synthwave.css

**Files:**
- Modify: `src/styles/synthwave.css` (append mobile refinement block)

- [ ] **Step 1: Append this block at the end of `src/styles/synthwave.css`:**

```css

/* ============================================================
   Mobile UX refinement (2026-04-22 audit)
   Three-tier breakpoints: ≤640 phone, 641–880 large phone, 881+ desktop.
   ============================================================ */

/* ---- Shell side padding (was 28px 32px 32px desktop only) ---- */
@media (max-width: 640px) {
  .sw-shell { padding: 16px 14px 24px !important; }
}
@media (min-width: 641px) and (max-width: 880px) {
  .sw-shell { padding: 20px 20px 28px !important; }
}

/* ---- Section head rhythm ---- */
@media (max-width: 880px) {
  .section-head {
    margin: 40px 0 14px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .section-head h2 {
    font-size: 17px;
    letter-spacing: 0.18em;
    gap: 10px;
  }
  .section-head .meta { font-size: 9px; }
}

/* ---- Footer ---- */
@media (max-width: 880px) {
  .sw-bottom {
    margin-top: 40px;
    padding: 20px 12px;
    gap: 8px;
    font-size: 10px;
    flex-direction: column;
    text-align: center;
  }
  .sw-bottom-right { justify-content: center; gap: 12px; flex-wrap: wrap; }
}

/* ---- Panel title badge on tiny viewports ---- */
@media (max-width: 640px) {
  .panel-title {
    left: 10px;
    letter-spacing: 0.22em;
    font-size: 9px;
    padding: 0 6px;
  }
}

/* ---- Scanlines dialed down on mobile (OLED moiré) ---- */
@media (max-width: 880px) {
  :root { --scan-alpha: 0.18; }
  body[data-reading="true"] { --scan-alpha: 0.08; }
}

/* ---- Header: tighten chrome on mobile ---- */
@media (max-width: 880px) {
  .sw-top {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "brand sys"
      "nav   nav";
    gap: 8px;
    padding: 10px 12px;
    backdrop-filter: none;
    box-shadow:
      inset 0 0 0 1px rgba(255, 43, 214, 0.10),
      0 0 14px rgba(34, 231, 255, calc(0.15 * var(--glow)));
  }
  .sw-brand { grid-area: brand; }
  .sw-sysbar { grid-area: sys; }
  .sw-nav {
    grid-area: nav;
    width: 100%;
    padding-top: 8px;
    border-top: 1px solid rgba(34, 231, 255, 0.12);
    justify-content: flex-start !important;
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
  .sw-nav-link {
    padding: 8px 10px;
    font-size: 10px;
    letter-spacing: 0.2em;
  }
}
@media (max-width: 640px) {
  .sw-brand-sub { display: none; }
  .sw-sysbar > span:last-child { display: none; }
}

/* ---- Mobile: universal panel interior padding overrides ---- */
@media (max-width: 640px) {
  .sw-hero { padding: 36px 18px 28px !important; }
  .sw-blog-top,
  .sw-projects-top,
  .sw-cs-top { padding: 24px 16px 16px !important; }
  .sw-article,
  .sw-cs-detail { padding: 24px 16px !important; }
  .sw-about-grid { padding: 24px 16px !important; gap: 24px !important; }
  .sw-projects-grid { padding: 0 12px 24px !important; }
  .sw-post { padding: 16px 14px !important; gap: 8px !important; }
}

/* ---- Hero title + sub ---- */
@media (max-width: 640px) {
  .sw-hero-title { font-size: clamp(36px, 11vw, 48px); }
  .sw-hero-title .sub {
    letter-spacing: 0.35em;
    font-size: 12px;
    margin-top: 10px;
  }
  .sw-hero-bio {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .sw-hero-ctas { gap: 10px; }
  .sw-hero-ctas .btn {
    flex: 1;
    justify-content: center;
    padding: 11px 12px;
    letter-spacing: 0.18em;
  }
  .sw-hero-grid { gap: 24px; }
  /* Move PlayerCard BELOW hero text on mobile (was order: -1) */
  .sw-hero-right { order: 2; padding-top: 0; }
}

/* ---- PlayerCard mobile slimming ---- */
@media (max-width: 640px) {
  .sw-id-card { padding: 14px; }
  .sw-id-hero { max-width: 320px; }
  .sw-id-photo {
    aspect-ratio: 16 / 10;
    margin-bottom: 10px;
  }
  .sw-id-photo::after { font-size: 15px; }
}

/* ---- Page titles: clamp fixed 44px headings ---- */
.sw-blog-title,
.sw-projects-title,
.sw-cs-page-title,
.sw-about-main h1 {
  font-size: clamp(30px, 7vw, 44px) !important;
}

/* ---- Prose tuning on mobile ---- */
@media (max-width: 640px) {
  .sw-prose { font-size: 15.5px; line-height: 1.65; }
  .sw-prose :global(h2),
  .sw-cs-body :global(h2) {
    font-size: 17px;
    margin: 32px 0 12px;
    letter-spacing: 0.08em;
  }
  .sw-prose :global(h3),
  .sw-cs-body :global(h3) {
    font-size: 14.5px;
    margin: 24px 0 10px;
  }
}

/* ---- Tag pills readability ---- */
@media (max-width: 640px) {
  .sw-tag {
    font-size: 10px;
    letter-spacing: 0.14em;
    padding: 3px 6px;
  }
}

/* ---- Scroll indicator: hide on mobile ---- */
@media (max-width: 880px) {
  #sw-scrollrail,
  #sw-scrollthumb,
  #sw-scrollpct { display: none !important; }
}

/* ---- Case study dossier: below article on mobile, not above ---- */
@media (max-width: 880px) {
  .sw-cs-grid { grid-template-columns: 1fr; gap: 24px; }
  .sw-cs-side { order: 2; }
  .sw-cs-side .sw-dossier { position: static; }
}
@media (max-width: 640px) {
  .sw-dossier { padding: 14px; }
  .sw-dossier-row { padding: 8px 0; }
  .sw-dossier-row dd { font-size: 11.5px; }
}

/* ---- Projects: breakpoint refactor (keep 2-col on tablets) ---- */
@media (min-width: 641px) and (max-width: 880px) {
  .sw-projects-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .sw-projects-grid { grid-template-columns: 1fr !important; }
  .sw-project { padding: 18px 14px 14px; }
  .sw-project-name { font-size: 16px; }
  .sw-project-tag { font-size: 13px; }
  .sw-project-body { font-size: 13px; }
}

/* ---- About: breakpoint refactor ---- */
@media (min-width: 641px) and (max-width: 880px) {
  .sw-about-grid { grid-template-columns: 1fr 260px; gap: 32px; }
}

/* ---- Blog search input: larger touch target ---- */
@media (max-width: 640px) {
  .swSearchInput,
  .sw-search-input {
    padding: 14px 14px 14px 36px !important;
    font-size: 14px !important;
  }
}
```

- [ ] **Step 2: Build**

Run: `bun run build`
Expected: clean build, 13 pages indexed.

- [ ] **Step 3: Commit**

```bash
git add src/styles/synthwave.css
git commit -m "feat: mobile UX refinement — interior padding, header, scroll indicator, dossier order, breakpoint tiers"
```

---

## Task 2: Verify on mobile + tablet + desktop

- [ ] **Step 1: Start preview and visit each route at each breakpoint**

```
bun run dev
```

Check these viewports for each URL listed below:

- Phone: 375×812
- Large phone: 414×896
- Tablet: 768×1024
- Desktop: 1280×900

URLs:
- `/`
- `/blog`
- `/blog/welcome`
- `/case-studies`
- `/case-studies/tcb-games`
- `/projects`
- `/about`
- Navigate to `/nope` to see 404

Confirm per viewport:
- **375/414:** no horizontal overflow; panel content reaches near viewport edges with ~14–16px padding; nav shows BLOG / CASE STUDIES / PROJECTS / ABOUT either inline or scrollable; sysbar shows LED + clock only (no "SYS ONLINE" word); brand shows MCNEES only (no "//NEON.SYS v2.86" sub); PlayerCard sits BELOW hero text on home; dossier sits BELOW narrative on case-study detail; no scroll indicator; page titles don't overflow; section-head gap under hero no longer feels like a canyon.
- **768:** projects grid renders as 2 columns; about-grid shows main + 260px sidebar; header uses stacked rows (mobile treatment) but content reads relaxed; no scroll indicator.
- **1280:** desktop behavior unchanged — scroll indicator visible, full backdrop blur on header, all original paddings in effect.

- [ ] **Step 2: Confirm no console errors across all visited routes.**

- [ ] **Step 3: If any regressions spotted, fix inline and commit as `fix:` follow-ups.**

---

## Notes on deviation from audit

- The audit suggested small `brand.astro` / `sysbar.astro` internal CSS edits; these are handled via `:global`-safe selectors from `synthwave.css` instead of touching each component, avoiding component surgery.
- `post-list.astro` internal class `.sw-post` is already defined inside the component's `<style>`. The `!important` overrides in `synthwave.css` beat the component-scoped rule; acceptable tradeoff for reach.
- Breakpoint refactor is applied per-rule rather than as a blanket rewrite — avoids touching code that's already correct at 880.
