# Case Studies and Portfolio Projects — Design

**Date:** 2026-04-16
**Status:** Approved for implementation planning

## Goal

Add two new content areas to mcnees.me:

1. **Case Studies** — long-form narrative write-ups of client/community work. Seed content: TCB Games, Creekside Shores Portal.
2. **Projects** — short portfolio cards for personal / side projects. Seed content: Mantle, Honeydew, Retro Estates, homey-vivint.

## Architecture

### Content collections

Two new Astro content collections alongside the existing `blog` collection, defined in `src/content.config.ts`.

#### `case-studies`

```
src/content/case-studies/*.mdx
```

Schema:

```ts
{
  title: string,
  role: string,              // e.g. "Builder & technical lead"
  timeframe: string,         // e.g. "2024 – present"
  client?: string,           // optional display name
  url?: string,              // live site
  repo?: string,             // public repo if any
  stack: string[],           // shown as chips in sidebar
  outcome: string,           // one-line summary for sidebar and index card
  summary: string,           // 1-2 sentence card blurb on index page
  date: Date,
  draft: boolean,
  order?: number             // optional manual sort
}
```

Body = MDX narrative prose. Sidebar metadata is auto-rendered by the detail template; the writer doesn't handle layout.

#### `projects`

```
src/content/projects/*.mdx
```

Schema:

```ts
{
  name: string,
  tagline: string,                             // one-liner
  status: 'alpha' | 'beta' | 'stable',
  stack: string[],
  url?: string,
  repo?: string,
  order?: number,
  draft: boolean
}
```

Body = 2-3 sentence "why it exists / what it does" paragraph. Rendered inline on the projects index page; no detail route.

### Pages & routing

```
src/pages/
  case-studies/
    index.astro           # grid/list of cards linking to detail pages
    [slug].astro          # narrative + metadata sidebar
  projects/
    index.astro           # grid of cards, no detail pages
```

Case study detail layout:

- Desktop: narrative body (main column) + sticky sidebar (role, timeframe, stack chips, outcome, links).
- Mobile: sidebar collapses above narrative.

Projects index: grid of cards. Each card = name + status badge + tagline + paragraph + stack chips + link buttons.

### Navigation

Update `src/layouts/base-layout.astro` `navLinks`:

```
Home / Blog / Case Studies / Projects / About
```

Active-state highlighting uses the existing `currentPath.startsWith(href + "/")` logic, which already handles nested detail routes.

### New components

All under `src/components/`:

- `case-study-card.astro` — used on case studies index
- `case-study-sidebar.astro` — used on case study detail page
- `project-card.astro` — used on projects index
- `status-badge.astro` — pill for alpha/beta/stable

Stack chips reuse the existing `hashToHue` utility (`src/utils/tag-color.ts`) so colors stay deterministic and match the blog tag styling.

## Content

Content drafted by the Technical Writer subagent, reviewed by the Brand Guardian subagent against the established voice (narrative-first, confident, genuine emotion, technical details woven in).

### Case studies

**TCB Games** (`tcb.games`)
- Role: Builder (friend of owner)
- Origin: Overheard owner discussing an award that required a web presence; introduced myself, became friends, took on the build.
- Problem: Local retail only; needed a complete eCommerce channel.
- Approach: Integrated Lightspeed POS ↔ Shopify via SkuIQ. Custom storefront on Next.js + Retro UI with detail-obsessed easter eggs.
- Stack: Next.js, Retro UI, Shopify, Lightspeed, SkuIQ.

**Creekside Shores Portal** (`creeksideshores.com`)
- Role: Owner/resident, board volunteer, builder.
- Origin: Current board wanted to step down; I volunteered, learned they wanted to replace the neighborhood Facebook group on lawyer's advice.
- Approach: Cloudflare-first build.
- Stack: Astro 6, Better Auth, Drizzle, D1, R2, Queues (external notifications), Durable Objects (in-app realtime), KV (sessions), SendGrid, Twilio.

### Projects

**Mantle** — `mantle.dvflw.co` · `github.com/dvflw/mantle`
- Status: beta
- Tagline: IaC lifecycle for AI workflows. YAML in, Postgres state, single Go binary.
- Stack: Go, Postgres, BSL 1.1.

**Honeydew** — `honeydewdone.app` (no repo — future SaaS)
- Status: beta
- Tagline: Offline-first home management where the home (not the user) is the primary entity.
- Stack: Next.js, Cloudflare Workers, Durable Objects, D1, Drizzle, Turborepo, Bun.

**Retro Estates** — no public links (closed-source, alpha)
- Status: alpha
- Tagline: Cozy mobile-first neighborhood stewardship sim. Paid upfront, zero IAP, strictly anti-dark-pattern.
- Stack: SwiftUI, SpriteKit, iOS/iPadOS/macOS.

**homey-vivint** — `github.com/dvflw/homey-vivint` (Homey App Store link TBD)
- Status: alpha
- Tagline: Homey integration for Vivint security systems — alarm events, locks, thermostats, cameras.
- Stack: TypeScript, Homey Apps SDK 3.

## Authoring & review workflow

1. Technical Writer subagent drafts MDX for each case study and project from the sources above.
2. Brand Guardian subagent reviews each draft against voice guidelines (narrative-first, confident, genuine emotion, no corporate fluff) and returns revision notes.
3. Apply notes, commit, preview locally, ship.

## Verification

- `bun run build` clean; no broken links.
- Dev server preview: every new page renders; nav active states correct; mobile sidebar stacks; dark mode intact.
- Lighthouse no regressions on the homepage or existing blog pages.

## Explicitly out of scope

- Pagefind search integration for the new collections (blog only for now).
- RSS feed for case studies or projects.
- Screenshots / hero imagery (asset wrangling deferred).
- Case study detail pages for every project — projects stay as cards only.
