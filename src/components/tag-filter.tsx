import { useState } from "react";
import { hashToHue } from "@/utils/tag-color";
import styles from "./tag-filter.module.css";

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
  const [activeTag, setActiveTag] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("tag");
    }
    return null;
  });

  function selectTag(tag: string | null) {
    setActiveTag(tag);
    const url = new URL(window.location.href);
    if (tag) {
      url.searchParams.set("tag", tag);
    } else {
      url.searchParams.delete("tag");
    }
    window.history.replaceState({}, "", url.toString());
  }

  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <div>
      <div className={styles.swTagWrap}>
        <button
          onClick={() => selectTag(null)}
          className={`${styles.swTagbtn}${!activeTag ? ` ${styles.swTagbtnOn}` : ""}`}
        >
          All
        </button>
        {allTags.map((tag) => {
          const hue = hashToHue(tag);
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => selectTag(activeTag === tag ? null : tag)}
              className={`${styles.swTagbtn}${isActive ? ` ${styles.swTagbtnOn}` : ""}`}
              style={isActive ? undefined : { borderColor: `oklch(0.72 0.15 ${hue} / 0.6)` }}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <ul className={styles.swPostList}>
        {filtered.map((post) => {
          const d = new Date(post.date);
          const pad = (n: number) => String(n).padStart(2, "0");
          const formatted = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
          return (
            <li key={post.id}>
              <a href={`/blog/${post.id}`} className={styles.swPost}>
                <span className={styles.swPostDate}>{formatted}</span>
                <div>
                  <h3 className={styles.swPostTitle}>{post.title}</h3>
                  <p className={styles.swPostDesc}>{post.description}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
