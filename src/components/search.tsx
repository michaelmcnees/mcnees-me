import { useState, useRef, useCallback } from "react";

interface PagefindResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

interface PagefindResponse {
  results: { data: () => Promise<PagefindResult> }[];
}

interface PagefindAPI {
  init: () => Promise<void>;
  search: (query: string) => Promise<PagefindResponse>;
}

async function getPagefind(): Promise<PagefindAPI | null> {
  try {
    // Construct the path dynamically so Vite doesn't try to resolve it
    const base = "/pagefind/pagefind.js";
    const pf = await import(/* @vite-ignore */ base);
    await pf.init();
    return pf;
  } catch {
    return null;
  }
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pagefindRef = useRef<PagefindAPI | null>(null);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    if (!pagefindRef.current) {
      pagefindRef.current = await getPagefind();
    }
    if (!pagefindRef.current) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await pagefindRef.current.search(value);
      const data = await Promise.all(
        response.results.slice(0, 8).map((r) => r.data())
      );
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search posts..."
        className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-lg px-4 py-2 text-sm text-[var(--color-on-surface-variant)] placeholder-[var(--color-outline)] focus:outline-none focus:border-[var(--color-outline)] focus-visible:ring-2 focus-visible:ring-accent/50"
      />
      {isLoading && (
        <p className="text-xs text-[var(--color-outline)] mt-2">Searching...</p>
      )}
      {results.length > 0 && (
        <ul className="mt-4 space-y-1 list-none p-0">
          {results.map((result) => (
            <li key={result.url}>
              <a
                href={result.url}
                className="block no-underline group rounded-lg px-3 py-2.5 -mx-3 hover:bg-[var(--color-surface-container-low)] transition-colors"
              >
                <h4 className="text-[var(--color-on-surface)] text-sm font-medium group-hover:text-accent transition-colors">
                  {result.meta.title}
                </h4>
                <p
                  className="text-xs text-[var(--color-on-surface-variant)] mt-1 leading-relaxed line-clamp-2 [&_mark]:bg-accent/20 [&_mark]:text-accent-hover [&_mark]:rounded-sm [&_mark]:px-0.5"
                  dangerouslySetInnerHTML={{ __html: result.excerpt }}
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      {query && !isLoading && results.length === 0 && (
        <p className="text-xs text-[var(--color-outline)] mt-2">No results found.</p>
      )}
    </div>
  );
}
