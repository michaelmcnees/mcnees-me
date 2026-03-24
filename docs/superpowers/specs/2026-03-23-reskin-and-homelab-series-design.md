# Design: Site Reskin + Homelab Blog Series

Two workstreams: reskin mcnees.me using the mantle design system (adapted to electric blue), and plan the "Upgrading the Homelab" blog series.

## Workstream 1: Site Reskin

### Color System

Replace the current oklch sky-blue accent and gray-950 base with mantle's surface hierarchy, hue-shifted from neon green to electric blue.

**Surfaces (from mantle, unchanged):**

| Token | Value | Usage |
|-------|-------|-------|
| `surface` | `#0e0e0e` | Base background |
| `surface-container-lowest` | `#000000` | Deepest layer |
| `surface-container-low` | `#131313` | Code blocks, recessed areas |
| `surface-container` | `#1a1919` | Cards, post separators |
| `surface-container-high` | `#201f1f` | Elevated elements (tag badges) |
| `surface-container-highest` | `#262626` | Highest elevation |
| `surface-variant` | `#262626` | Variant surfaces |

**Accent colors (mantle green → electric blue):**

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#a4d4ff` | Links, active states, primary accent |
| `primary-dim` | `#00b4ff` | Hover/pressed states |
| `secondary` | `#72d4fb` | Secondary highlights |
| `tertiary` | `#7ee6ff` | Code syntax, decorative accents |

**Text and outline (from mantle, unchanged):**

| Token | Value | Usage |
|-------|-------|-------|
| `on-surface` | `#ffffff` | Primary text, headings |
| `on-surface-variant` | `#adaaaa` | Secondary/body text |
| `outline` | `#777575` | Borders, dividers |
| `outline-variant` | `#494847` | Subtle borders |

**Error:** `#ff716c` (from mantle, unchanged)

### Typography

Add three Google Fonts, replacing the system font stack:

- **Space Grotesk** (400, 500, 600, 700) — headings, logo, page titles
- **Inter** (400, 500, 600, 700) — body text, UI labels, descriptions
- **JetBrains Mono** (400, 500) — dates, tags, code blocks, section labels, inline code

### Navigation Changes

- Remove the guitar-dot active indicator (small rounded circle with radial gradient)
- Replace with `border-bottom: 2px solid #a4d4ff` on the active nav link
- Keep the existing nav structure (logo left, links right)

### Tag Badge System

Deterministic color generation from tag strings — no mapping table needed.

**Algorithm:**
1. Hash the tag string to produce a hue value (0-360) using a simple char-code hash
2. Use `oklch(0.72 0.15 hue)` for the left border color
3. Consistent styling for all tags regardless of hue

**Styling:**
- Left border: `3px solid oklch(0.72 0.15 hue)`
- Background: `#201f1f` (surface-container-high)
- Box shadow: `0 1px 2px rgba(0,0,0,0.4)`
- Text: `#adaaaa` (on-surface-variant)
- Font: JetBrains Mono, 12px

**Hash function** (implemented as a shared utility, used by both Astro and React components):

```
function hashToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash) % 360;
}
```

### Components to Remove

- `circuit-divider.astro` — delete the component and all references to it

### Components to Keep (re-themed)

- **Konami code easter egg** — update colors from sky-blue to electric blue palette
- **CRT 404 page** — update accent colors, keep the GAME OVER aesthetic and flicker animation
- **Green LED status pulse** — keep as-is in footer ("System online")
- **Search component** — update border/focus colors to new accent
- **Tag filter component** — update active/hover states, integrate new tag badge styling

### What Does Not Change

- Site architecture: Astro 5, React 19, MDX, Pagefind, Cloudflare Pages
- Layout structure: `max-w-2xl` (672px), single `base-layout.astro`
- Content: all existing blog posts and pages
- D1 view counter, Pagefind search indexing
- Background pattern structure (hue will be updated to match new surface colors, but the diagonal stripe pattern itself is unchanged)

## Workstream 2: Homelab Blog Series

### Part 1: "Upgrading the Homelab, Part 1: Taking Stock"

**Frontmatter:**
```yaml
title: "Upgrading the Homelab, Part 1: Taking Stock"
description: "How we inventoried what we had, set our goals, and picked the hardware for the next generation."
tags: [homelab, hardware]
series: upgrading-the-homelab
seriesOrder: 1
```

**Tone:** Narrative-first. Reads like a story with technical details woven in to support decisions. Accessible to homelabbers at any level. Humor welcome (especially the monitoring/family angle).

**Structure — three acts:**

**Act 1: The Current State**
- The quartet of Dell 3050 Micros — what they are, what's running on them
- Proxmox + LXC setup, shoutout to Proxmox VE Helper Scripts for reliable deployment
- Paint the picture of a system that works but has outgrown its management model
- Pain points: Traefik is a single instance but managed by SSHing into its LXC — 47 routers, each its own file, typos have caused broken routers more than once. No centralized observability
- The monitoring problem: family members (wife, 5-year-old, roommate, and worst of all the mother-in-law who doesn't even live there) are the alerting system

**Act 2: Setting Goals**
- Priorities: consolidation, power efficiency, IaC, K8s, observability
- The shift from "manage things as one-offs in LXCs" to "everything in Git, orchestrated by K8s"
- Why observability matters — find out before the family does, and build trust that self-hosted alternatives actually work
- Introduce Marvin — experimenting with OpenClaw created a need for more powerful local AI
- The meta angle: Marvin helped plan the very upgrade he'd eventually migrate into
- This is where the 4→2 node decision happened — a late pivot driven by the AI compute need

**Act 3: The Hardware Decision**
- Why AMD 8700G: integrated graphics (no discrete GPU needed for basic tasks), power efficient, AM5 platform for upgradability
- The consolidation math: 4 low-power units → 2 that fit the same power budget with dramatically more headroom
- Build choices presented as narrative, not a spreadsheet — why each decision was made
- Ordering and anticipation

**Closing:** Simple one-liner teasing Part 2 (the build itself).

### Part 2: "Upgrading the Homelab, Part 2: The Build"

Placeholder only — establish frontmatter with `series: upgrading-the-homelab` and `seriesOrder: 2`. Content will be written after the actual build.

### Authoring Process

1. **Technical Writer subagent** — gather and organize technical details: current hardware specs, new build specs, power consumption numbers, K8s migration rationale, specific workloads being moved. Reference `~/Development/homelab` repo for planning docs and specs.
2. **Co-author subagent** — draft the actual post using the technical details and narrative structure above, in Michael's voice

These agents are dispatched during the implementation phase, not during design.
