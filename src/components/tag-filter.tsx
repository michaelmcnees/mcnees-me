import { useState } from "react";
import { hashToHue } from "@/utils/tag-color";

interface Post {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

interface Props {
  posts: Post[];
  allTags: string[];
}

export default function TagFilter({ posts, allTags }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs font-mono px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
            !activeTag
              ? "text-[var(--color-on-surface)] border-l-[3px] border-l-[var(--color-primary)]"
              : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
          }`}
          style={{
            background: "var(--color-surface-container-high)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
            ...(!activeTag ? {} : { borderLeft: "3px solid transparent" }),
          }}
        >
          All
        </button>
        {allTags.map((tag) => {
          const hue = hashToHue(tag);
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs font-mono px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
                isActive
                  ? "text-[var(--color-on-surface)]"
                  : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
              }`}
              style={{
                background: "var(--color-surface-container-high)",
                borderLeft: `3px solid oklch(0.72 0.15 ${hue})`,
                boxShadow: isActive
                  ? `0 1px 2px rgba(0,0,0,0.4), 0 0 8px oklch(0.72 0.15 ${hue} / 0.3)`
                  : "0 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <ul className="space-y-6 list-none p-0">
        {filtered.map((post) => {
          const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <li key={post.id}>
              <a href={`/blog/${post.id}`} className="group block no-underline">
                <h3 className="text-lg text-[var(--color-on-surface)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">{post.description}</p>
                <span className="text-[var(--color-on-surface-variant)] mt-1 block font-mono text-xs">{formattedDate}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
