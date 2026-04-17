# Case Studies and Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new Astro content collections — `case-studies` (long-form narrative) and `projects` (portfolio cards) — with index/detail pages, nav entries, and seed content reviewed by Technical Writer and Brand Guardian subagents.

**Architecture:** Two new collections defined in `src/content.config.ts`, new pages under `src/pages/case-studies/` and `src/pages/projects/`, shared chip/badge components under `src/components/`. Detail pages exist only for case studies; projects live entirely on their index page. Styling reuses the existing Tailwind v4 theme, `prose-invert`, and `hashToHue` tag color utility.

**Tech Stack:** Astro 5, MDX, Tailwind CSS v4, React 19 (existing, not used for new work), Bun.

**Spec:** `docs/superpowers/specs/2026-04-16-case-studies-and-projects-design.md`

**Test framework note:** This project has no automated test suite. Each task verifies via `bun run build` (type-checks content schemas and catches template errors) and a dev-server visual preview. Steps say "Commit" liberally — keep commits small and working.

---

## Task 1: Define new content collections

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Update content config to add `case-studies` and `projects` collections**

Replace the contents of `src/content.config.ts` with:

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    timeframe: z.string(),
    client: z.string().optional(),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    stack: z.array(z.string()).default([]),
    outcome: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    order: z.number().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    status: z.enum(["alpha", "beta", "stable"]),
    stack: z.array(z.string()).default([]),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, "case-studies": caseStudies, projects };
```

- [ ] **Step 2: Create empty content directories**

Run:
```bash
mkdir -p src/content/case-studies src/content/projects
```

- [ ] **Step 3: Verify build still passes (no content yet is OK — Astro warns but does not fail)**

Run: `bun run build`
Expected: build completes; may warn that collections are empty.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts
git commit -m "feat: add case-studies and projects content collections"
```

---

## Task 2: Stack chip component

A shared presentational chip for rendering stack/tech labels. Reuses `hashToHue` for deterministic color, same visual as blog tag chips but non-link.

**Files:**
- Create: `src/components/stack-chip.astro`

- [ ] **Step 1: Create `src/components/stack-chip.astro`**

```astro
---
import { hashToHue } from "@/utils/tag-color";

interface Props {
  label: string;
}

const { label } = Astro.props;
const hue = hashToHue(label);
---
<span
  class="text-xs font-mono text-on-surface-variant px-2 py-0.5 rounded-sm"
  style={`background: var(--color-surface-container-high); border-left: 3px solid oklch(0.72 0.15 ${hue}); box-shadow: 0 1px 2px rgba(0,0,0,0.4);`}
>
  {label}
</span>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/stack-chip.astro
git commit -m "feat: add stack-chip component"
```

---

## Task 3: Status badge component

Alpha / Beta / Stable pill with color coding.

**Files:**
- Create: `src/components/status-badge.astro`

- [ ] **Step 1: Create `src/components/status-badge.astro`**

```astro
---
interface Props {
  status: "alpha" | "beta" | "stable";
}

const { status } = Astro.props;

const colors: Record<Props["status"], string> = {
  alpha: "oklch(0.72 0.15 40)",
  beta: "oklch(0.72 0.15 200)",
  stable: "oklch(0.72 0.15 155)",
};
const color = colors[status];
---
<span
  class="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm"
  style={`color: ${color}; background: var(--color-surface-container-high); border: 1px solid ${color};`}
>
  {status}
</span>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/status-badge.astro
git commit -m "feat: add status-badge component"
```

---

## Task 4: Case study sidebar component

Sticky sidebar on detail page showing role, timeframe, stack, outcome, and links.

**Files:**
- Create: `src/components/case-study-sidebar.astro`

- [ ] **Step 1: Create `src/components/case-study-sidebar.astro`**

```astro
---
import StackChip from "@/components/stack-chip.astro";

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
<aside class="text-sm space-y-4 md:sticky md:top-8 md:self-start">
  <dl class="space-y-3">
    {client && (
      <div>
        <dt class="text-outline font-mono text-xs uppercase tracking-wider">Client</dt>
        <dd class="text-on-surface mt-1">{client}</dd>
      </div>
    )}
    <div>
      <dt class="text-outline font-mono text-xs uppercase tracking-wider">Role</dt>
      <dd class="text-on-surface mt-1">{role}</dd>
    </div>
    <div>
      <dt class="text-outline font-mono text-xs uppercase tracking-wider">Timeframe</dt>
      <dd class="text-on-surface mt-1">{timeframe}</dd>
    </div>
    <div>
      <dt class="text-outline font-mono text-xs uppercase tracking-wider">Outcome</dt>
      <dd class="text-on-surface mt-1">{outcome}</dd>
    </div>
    {stack.length > 0 && (
      <div>
        <dt class="text-outline font-mono text-xs uppercase tracking-wider">Stack</dt>
        <dd class="mt-2 flex flex-wrap gap-2">
          {stack.map((s) => <StackChip label={s} />)}
        </dd>
      </div>
    )}
  </dl>
  {(url || repo) && (
    <div class="flex flex-col gap-2 pt-2 border-t border-outline/20">
      {url && <a href={url} target="_blank" rel="noopener" class="text-sm">Visit site &rarr;</a>}
      {repo && <a href={repo} target="_blank" rel="noopener" class="text-sm">View repo &rarr;</a>}
    </div>
  )}
</aside>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/case-study-sidebar.astro
git commit -m "feat: add case-study-sidebar component"
```

---

## Task 5: Case study card component

Used on the case studies index page.

**Files:**
- Create: `src/components/case-study-card.astro`

- [ ] **Step 1: Create `src/components/case-study-card.astro`**

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  entry: CollectionEntry<"case-studies">;
}

const { entry } = Astro.props;
---
<a href={`/case-studies/${entry.id}`} class="group block no-underline py-6 border-b border-outline/15 transition-transform hover:translate-x-1">
  <h3 class="text-lg text-on-surface font-medium group-hover:text-accent transition-colors">
    {entry.data.title}
  </h3>
  <p class="text-sm text-on-surface-variant mt-1">{entry.data.summary}</p>
  <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-outline">
    <span>{entry.data.role}</span>
    <span aria-hidden="true">&middot;</span>
    <span>{entry.data.timeframe}</span>
  </div>
</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/case-study-card.astro
git commit -m "feat: add case-study-card component"
```

---

## Task 6: Project card component

Used on the projects index page. Renders the MDX body inline via a slot.

**Files:**
- Create: `src/components/project-card.astro`

- [ ] **Step 1: Create `src/components/project-card.astro`**

```astro
---
import type { CollectionEntry } from "astro:content";
import StackChip from "@/components/stack-chip.astro";
import StatusBadge from "@/components/status-badge.astro";

interface Props {
  entry: CollectionEntry<"projects">;
}

const { entry } = Astro.props;
const { name, tagline, status, stack, url, repo } = entry.data;
---
<article class="py-6 border-b border-outline/15">
  <header class="flex flex-wrap items-center gap-3">
    <h3 class="text-lg text-on-surface font-medium">{name}</h3>
    <StatusBadge status={status} />
  </header>
  <p class="text-sm text-on-surface-variant mt-1">{tagline}</p>
  <div class="prose prose-invert prose-sm mt-3 max-w-none">
    <slot />
  </div>
  {stack.length > 0 && (
    <div class="mt-3 flex flex-wrap gap-2">
      {stack.map((s) => <StackChip label={s} />)}
    </div>
  )}
  {(url || repo) && (
    <div class="mt-3 flex flex-wrap gap-4 text-sm">
      {url && <a href={url} target="_blank" rel="noopener">Visit site &rarr;</a>}
      {repo && <a href={repo} target="_blank" rel="noopener">View repo &rarr;</a>}
    </div>
  )}
</article>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project-card.astro
git commit -m "feat: add project-card component"
```

---

## Task 7: Case studies index page

**Files:**
- Create: `src/pages/case-studies/index.astro`

- [ ] **Step 1: Create `src/pages/case-studies/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
import CaseStudyCard from "@/components/case-study-card.astro";

const entries = await getCollection("case-studies", ({ data }) => !data.draft);
const sorted = entries.sort((a, b) => {
  const orderDelta = (a.data.order ?? Infinity) - (b.data.order ?? Infinity);
  if (orderDelta !== 0) return orderDelta;
  return b.data.date.getTime() - a.data.date.getTime();
});
---
<BaseLayout title="Case Studies — Michael McNees" description="Long-form write-ups of client and community work.">
  <section class="py-16">
    <h1 class="text-4xl font-bold text-on-surface mb-3 tracking-tight" style="font-family: var(--font-heading);">Case Studies</h1>
    <p class="text-lg text-on-surface-variant leading-relaxed max-w-lg">
      Longer write-ups of work I've done for clients, communities, and friends.
    </p>
  </section>
  <section class="pb-16">
    {sorted.length === 0 ? (
      <p class="text-on-surface-variant">No case studies yet.</p>
    ) : (
      <div class="list-none p-0">
        {sorted.map((entry) => <CaseStudyCard entry={entry} />)}
      </div>
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/case-studies/index.astro
git commit -m "feat: add case studies index page"
```

---

## Task 8: Case study detail page

**Files:**
- Create: `src/pages/case-studies/[slug].astro`

- [ ] **Step 1: Create `src/pages/case-studies/[slug].astro`**

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
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
<BaseLayout title={`${entry.data.title} — Michael McNees`} description={entry.data.summary}>
  <article class="py-12">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-on-surface mb-3 tracking-tight">{entry.data.title}</h1>
      <p class="text-on-surface-variant">{entry.data.summary}</p>
    </header>
    <div class="grid gap-10 md:grid-cols-[1fr_16rem]">
      <div class="prose prose-invert max-w-none order-2 md:order-1">
        <Content />
      </div>
      <div class="order-1 md:order-2">
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
  </article>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/case-studies/[slug].astro
git commit -m "feat: add case study detail page"
```

---

## Task 9: Projects index page

**Files:**
- Create: `src/pages/projects/index.astro`

- [ ] **Step 1: Create `src/pages/projects/index.astro`**

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "@/layouts/base-layout.astro";
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
<BaseLayout title="Projects — Michael McNees" description="Side projects, tools, and experiments.">
  <section class="py-16">
    <h1 class="text-4xl font-bold text-on-surface mb-3 tracking-tight" style="font-family: var(--font-heading);">Projects</h1>
    <p class="text-lg text-on-surface-variant leading-relaxed max-w-lg">
      Side projects, tools, and experiments — some shipping, some still finding their shape.
    </p>
  </section>
  <section class="pb-16">
    {rendered.length === 0 ? (
      <p class="text-on-surface-variant">No projects yet.</p>
    ) : (
      rendered.map(({ entry, Content }) => (
        <ProjectCard entry={entry}>
          <Content />
        </ProjectCard>
      ))
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/projects/index.astro
git commit -m "feat: add projects index page"
```

---

## Task 10: Update nav

**Files:**
- Modify: `src/layouts/base-layout.astro:12-16`

- [ ] **Step 1: Add Case Studies and Projects entries**

Replace:

```ts
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];
```

With:

```ts
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];
```

- [ ] **Step 2: Build to confirm nothing breaks**

Run: `bun run build`
Expected: build completes. Empty collections are OK; pages render the "No case studies yet." / "No projects yet." states.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/base-layout.astro
git commit -m "feat: add case studies and projects to nav"
```

---

## Task 11: Draft case study content (Technical Writer subagent)

Dispatch the `Technical Writer` subagent to draft both case studies from the source material. Then dispatch the `Brand Guardian` subagent to review against voice.

**Files:**
- Create: `src/content/case-studies/tcb-games.mdx`
- Create: `src/content/case-studies/creekside-shores-portal.mdx`

- [ ] **Step 1: Dispatch Technical Writer for TCB Games**

Use the Agent tool with `subagent_type: "Technical Writer"`. Prompt:

> Write a case study MDX file for Michael McNees's personal site at `src/content/case-studies/tcb-games.mdx`. The site voice is narrative-first, confident (not soft), with genuine emotion and technical details woven into the story. Not corporate. First-person.
>
> Frontmatter (use exactly these keys):
> ```yaml
> ---
> title: TCB Games
> role: Builder & friend of the shop
> timeframe: 2023 – present
> client: TCB Games
> url: https://tcb.games
> stack:
>   - Next.js
>   - Retro UI
>   - Shopify
>   - Lightspeed
>   - SkuIQ
> outcome: Local retro game shop became a full eCommerce channel without abandoning the store that made it special.
> summary: How a conversation overheard at the counter turned into a custom eCommerce build for a local retro game shop.
> date: 2024-06-01
> ---
> ```
>
> Narrative to cover (600-900 words):
> - The origin: Michael was a regular customer. Overheard the owner telling staff they needed a web presence to qualify for an industry award. Introduced himself, became friends with the owner, took on the build.
> - The problem: the shop sold only in-store. No online channel. Inventory lived in Lightspeed (their POS).
> - The approach: integrate Lightspeed ↔ Shopify via SkuIQ so one inventory feeds both. Build a custom Next.js storefront on top of Retro UI. Late nights sweating easter eggs and nerdy details because the shop's whole brand is built on care about the craft.
> - What shipped: a complete eCommerce channel with the soul of the physical store intact.
>
> Do NOT invent facts or metrics. Don't add corporate buzzwords ("leveraged", "streamlined", "end-to-end solution"). Write the way Michael writes in his existing blog posts under `src/content/blog/` — read one or two (e.g., `upgrading-the-homelab-part-1-taking-stock.mdx`) before drafting to match cadence.

- [ ] **Step 2: Dispatch Technical Writer for Creekside Shores**

Same subagent type. Prompt:

> Write a case study MDX file at `src/content/case-studies/creekside-shores-portal.mdx`. Same voice guide as the TCB Games case study (narrative-first, confident, first-person, genuine emotion, no corporate buzzwords).
>
> Frontmatter:
> ```yaml
> ---
> title: Creekside Shores Portal
> role: Board volunteer & builder
> timeframe: 2025 – present
> client: Creekside Shores HOA
> url: https://creeksideshores.com
> stack:
>   - Astro
>   - Better Auth
>   - Drizzle
>   - Cloudflare D1
>   - Cloudflare R2
>   - Cloudflare Queues
>   - Durable Objects
>   - Cloudflare KV
>   - SendGrid
>   - Twilio
> outcome: The neighborhood has a legally sound, private communication channel the board actually controls.
> summary: Replacing a problematic neighborhood Facebook group with a Cloudflare-first portal — because the HOA's lawyer said the Facebook group had to go.
> date: 2026-02-01
> ---
> ```
>
> Narrative to cover (700-1000 words):
> - Origin: Michael is an owner and resident. An email went out saying the current HOA board wanted to step down and needed volunteers. He volunteered, joined the board, and learned they'd been looking at building a site to replace the neighborhood Facebook group — the HOA's lawyer had advised they stop using it.
> - Problem: Facebook groups are not legally defensible for HOA communication. The board needed a private, archived, auditable channel they owned.
> - Approach: Cloudflare-first. Astro for the site. Better Auth for identity. Drizzle against D1 for data. R2 for documents. Queues for scheduling outbound notifications. Durable Objects for realtime in-app notifications. KV for auth sessions. SendGrid for email, Twilio for SMS.
> - Why Cloudflare-first matters here: cheap, global, reliable enough for a volunteer-run HOA with no on-call.
> - What shipped: a portal where the board controls the conversation and the archive.
>
> Do NOT invent metrics or adoption numbers. Read a couple existing blog posts under `src/content/blog/` to match cadence before drafting.

- [ ] **Step 3: Dispatch Brand Guardian to review both drafts**

Use the Agent tool with `subagent_type: "Brand Guardian"`. Prompt:

> Review these two MDX case study drafts for voice consistency with Michael McNees's brand:
>
> - `src/content/case-studies/tcb-games.mdx`
> - `src/content/case-studies/creekside-shores-portal.mdx`
>
> Voice guide:
> - Narrative-first. Technical details woven in, not listed.
> - Confident, not soft. Owns opinions.
> - Genuine emotion, not corporate metaphors — especially around people.
> - First-person. Michael's perspective.
> - No buzzwords: "leveraged", "streamlined", "end-to-end solution", "unlocked value", "best-in-class", "robust".
> - Compare against existing blog posts in `src/content/blog/` — especially `upgrading-the-homelab-part-1-taking-stock.mdx` and `from-engineer-to-engineering-manager.mdx` — to calibrate.
>
> Return a bulleted list of specific line-level changes (original → suggested). Do not edit the files. Do not rewrite wholesale — preserve the writer's structure and only flag lines that miss the voice.

- [ ] **Step 4: Apply the Brand Guardian's notes**

Read each note, apply it to the relevant MDX file. If a note is unclear or you disagree, note it and move on — do not relitigate the Brand Guardian's judgment unless it contradicts the spec.

- [ ] **Step 5: Build to validate frontmatter against schema**

Run: `bun run build`
Expected: build completes. If Zod rejects a field, fix the frontmatter and rebuild.

- [ ] **Step 6: Commit**

```bash
git add src/content/case-studies/
git commit -m "feat: add TCB Games and Creekside Shores case studies"
```

---

## Task 12: Draft project content (Technical Writer subagent)

Four MDX files, each with a 2-3 sentence body. Same review flow but lighter — projects are short.

**Files:**
- Create: `src/content/projects/mantle.mdx`
- Create: `src/content/projects/honeydew.mdx`
- Create: `src/content/projects/retro-estates.mdx`
- Create: `src/content/projects/homey-vivint.mdx`

- [ ] **Step 1: Dispatch Technical Writer to draft all four project entries**

Use `subagent_type: "Technical Writer"`. Prompt:

> Write four short project MDX files in `src/content/projects/`. Each body is 2-3 sentences explaining what the project is and why it exists. Match Michael McNees's voice (narrative-first, confident, first-person, no corporate buzzwords). Read `src/content/blog/upgrading-the-homelab-part-1-taking-stock.mdx` for cadence.
>
> Frontmatter schema (use exactly these keys):
> ```yaml
> ---
> name: <string>
> tagline: <one-liner>
> status: alpha | beta | stable
> stack: [array of strings]
> url: <optional string>
> repo: <optional string>
> order: <optional number>
> ---
> ```
>
> **File: `mantle.mdx`**
> ```yaml
> name: Mantle
> tagline: Terraform for AI workflows. YAML definitions, Postgres state, one Go binary.
> status: beta
> stack: [Go, Postgres, YAML, BSL 1.1]
> url: https://mantle.dvflw.co
> repo: https://github.com/dvflw/mantle
> order: 1
> ```
> Body: Mantle applies the IaC lifecycle — validate / plan / apply / run — to AI workflow automation. BYOK, single binary, Postgres-only, crash-recoverable. Built because existing workflow tools either ignore AI or drown in it.
>
> **File: `honeydew.mdx`**
> ```yaml
> name: Honeydew
> tagline: Offline-first home management where the home — not the user — is the primary entity.
> status: beta
> stack: [Next.js, Cloudflare Workers, Durable Objects, D1, Drizzle, Turborepo, Bun]
> url: https://honeydewdone.app
> order: 2
> ```
> Body: Honeydew models households as the unit of organization, so chores, maintenance, and shared state stick with the home even as members come and go. A Cloudflare-native stack keeps sync cheap and global. Closed-source for now — a future SaaS.
>
> **File: `retro-estates.mdx`**
> ```yaml
> name: Retro Estates
> tagline: A cozy mobile-first neighborhood stewardship sim. Paid upfront, zero IAP, strictly anti-dark-pattern.
> status: alpha
> stack: [SwiftUI, SpriteKit, iOS, iPadOS, macOS]
> order: 3
> ```
> Body: You're the unofficial president of a tiny HOA, and the core fantasy is watching small policy choices ripple through neighbors you've grown to care about. No timers, no FOMO, no engagement mechanics — just consequence. Closed-source, alpha, built on weekends.
>
> **File: `homey-vivint.mdx`**
> ```yaml
> name: homey-vivint
> tagline: Homey integration for Vivint security systems — alarms, locks, thermostats, cameras.
> status: alpha
> stack: [TypeScript, Homey Apps SDK 3]
> repo: https://github.com/dvflw/homey-vivint
> order: 4
> ```
> Body: Brings Vivint panels into the Homey smart-home ecosystem so alarm events, door and window activity, locks, thermostats, and cameras live alongside everything else. SDK 3, local-runtime. App Store submission pending.
>
> Write the MDX bodies in Michael's voice — the sentences above are just the facts. Don't copy them verbatim if a better phrasing fits.

- [ ] **Step 2: Dispatch Brand Guardian to review**

Use `subagent_type: "Brand Guardian"`. Prompt:

> Review these four project MDX bodies for voice consistency with Michael McNees's brand:
>
> - `src/content/projects/mantle.mdx`
> - `src/content/projects/honeydew.mdx`
> - `src/content/projects/retro-estates.mdx`
> - `src/content/projects/homey-vivint.mdx`
>
> Voice guide: narrative-first, confident, first-person-where-natural, no corporate buzzwords (no "leveraged", "streamlined", "end-to-end", "best-in-class", "unlocked value"). Each body is only 2-3 sentences, so every word matters. Compare against existing blog posts in `src/content/blog/`.
>
> Return a bulleted list of specific line-level suggestions (original → suggested) for each file. Do not edit the files.

- [ ] **Step 3: Apply notes**

- [ ] **Step 4: Build to validate**

Run: `bun run build`
Expected: build completes, all four projects validate against schema.

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/
git commit -m "feat: add mantle, honeydew, retro estates, homey-vivint projects"
```

---

## Task 13: End-to-end verification

- [ ] **Step 1: Full build**

Run: `bun run build`
Expected: completes cleanly, no schema errors, no broken imports.

- [ ] **Step 2: Start dev server and visit every new route**

Run: `bun run dev`

Visit and visually confirm each:
- `http://localhost:4321/` — homepage still renders, unchanged.
- `http://localhost:4321/case-studies` — two cards (TCB Games, Creekside Shores).
- `http://localhost:4321/case-studies/tcb-games` — narrative + sidebar; sidebar has role/timeframe/stack/outcome/site link.
- `http://localhost:4321/case-studies/creekside-shores-portal` — same layout.
- `http://localhost:4321/projects` — four cards with status badges, stack chips, and appropriate links (Mantle shows site + repo; Honeydew site only; Retro Estates no links; homey-vivint repo only).
- `http://localhost:4321/about` — unchanged.
- `http://localhost:4321/blog` — unchanged.

Confirm:
- Nav shows Home / Blog / Case Studies / Projects / About with correct active highlighting on each route.
- Resize to mobile width: case study detail page stacks sidebar above narrative (order classes).
- Status badge colors render differently for alpha / beta.

- [ ] **Step 3: Commit any fixes**

If any fixes were needed during verification, commit them with a `fix:` prefix.

- [ ] **Step 4: Done**

Case studies and projects live.
