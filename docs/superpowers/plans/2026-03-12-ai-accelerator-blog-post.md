# AI Accelerator Blog Post — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write and publish a blog post arguing that AI is an accelerator for professional developers, not a replacement — honest about disruption, ultimately optimistic.

**Architecture:** Single MDX file in the existing Astro blog collection. No code changes, no component work — this is pure content.

**Tech Stack:** MDX, Astro content collections

**Spec:** `docs/superpowers/specs/2026-03-12-ai-accelerator-blog-post-design.md`

---

## Chunk 1: Write the Blog Post

### Task 1: Draft the blog post

**Files:**
- Create: `src/content/blog/the-calculator-didnt-kill-accounting.mdx`

**Reference files (read for voice/format, do not modify):**
- `src/content/blog/from-engineer-to-engineering-manager.mdx` — best example of the author's long-form voice
- `src/content/blog/ai-doesnt-know-your-smart-home-platform.mdx` — example of AI-topic post
- `docs/superpowers/specs/2026-03-12-ai-accelerator-blog-post-design.md` — the spec

**Agent:** Use the **Content Creator** agent for this task. Provide the spec, both reference posts, and the following writing brief.

**Writing brief for the Content Creator agent:**

Write a blog post in MDX format. The author is an engineering manager who writes in first person with a conversational, direct, honest voice. Study the two reference posts carefully — match that voice exactly. No corporate tone, no filler, no "in conclusion." Short paragraphs, generous whitespace.

The post must follow the spec's four-section structure:

1. **Opening — The Fear is Real.** Acknowledge the anxiety. Pivot to historical analogies (calculator/accountant, automated oven/baker, camera/artist) — light touch, 1-2 sentences each. Frame: every tool killed some jobs and transformed others.

2. **The Accelerator Thesis.** AI amplifies the professional. One expert + AI matches what took a team. State outsourcing economics plainly — no editorial on quality, just the math. Team sizes shrink, premium shifts to the person driving the AI.

3. **What We're Going to Get Wrong.** Two beats:
   - Junior pipeline problem (two failure modes): (a) companies cut junior roles entirely — short-sighted, those roles grow the next generation, 10-15 year consequences. State with strong conviction. (b) Companies that keep juniors restrict their AI access — handicaps them. AI literacy must be a core training strategy.
   - Broader downsizing — single abstract paragraph, no specific industries. Don't sugarcoat, don't dwell. Transitional beat.

4. **What Survives and Why — The Artisan Argument.** AI generates average output (trained on the median). Craft, taste, judgment survive. Brief baker analogy callback. Not "learn to prompt" — it's about caring deeply. End forward-facing and confident, no neat bow.

Use `##` subheadings. No target word count but lean longer — let ideas breathe.

Frontmatter format:
```yaml
---
title: "The Calculator Didn't Kill Accounting"
description: [one sentence, direct voice, captures the honest-but-optimistic angle]
date: 2026-03-12
tags: ["ai", "career", "leadership"]
draft: false
---
```

The title is a working title — the Content Creator may suggest alternatives if they feel something fits better, but it should remain a direct statement, no clickbait.

- [ ] **Step 1: Read the spec and both reference posts**
- [ ] **Step 2: Write the complete blog post draft to `src/content/blog/the-calculator-didnt-kill-accounting.mdx`**
- [ ] **Step 3: Verify the file has valid frontmatter and renders without errors**

Run: `cd /Users/michael/Development/mcnees-me && npx astro build 2>&1 | tail -20`

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit the draft**

```bash
git add src/content/blog/the-calculator-didnt-kill-accounting.mdx
git commit -m "feat: add AI accelerator blog post draft"
```

### Task 2: Author review and refinement

This task is manual — the author (Michael) reviews the draft and provides feedback. The Content Creator agent then incorporates edits.

- [ ] **Step 1: Author reads the draft and provides feedback**
- [ ] **Step 2: Content Creator agent incorporates feedback**
- [ ] **Step 3: Final commit**

```bash
git add src/content/blog/the-calculator-didnt-kill-accounting.mdx
git commit -m "feat: finalize AI accelerator blog post"
```
