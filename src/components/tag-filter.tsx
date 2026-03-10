import { useState } from "react";

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
          className={`text-xs px-2 py-0.5 rounded border transition-colors cursor-pointer ${
            !activeTag
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              activeTag === tag
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"
            }`}
          >
            {tag}
          </button>
        ))}
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
                <h3 className="text-lg text-gray-100 font-medium group-hover:text-sky-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{post.description}</p>
                <span className="text-sm text-gray-500 mt-1 block">{formattedDate}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
