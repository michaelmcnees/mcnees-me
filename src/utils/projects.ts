import type { CollectionEntry } from "astro:content";

/** Sort projects by their `order` field, then alphabetically by name. */
export function sortProjects(entries: CollectionEntry<"projects">[]) {
  return [...entries].sort((a, b) => {
    const orderDelta = (a.data.order ?? Infinity) - (b.data.order ?? Infinity);
    if (orderDelta !== 0) return orderDelta;
    return a.data.name.localeCompare(b.data.name);
  });
}
