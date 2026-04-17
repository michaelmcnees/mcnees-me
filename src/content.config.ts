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
