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
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 focus-visible:ring-2 focus-visible:ring-sky-400/50"
      />
      {isLoading && (
        <p className="text-xs text-gray-600 mt-2">Searching...</p>
      )}
      {results.length > 0 && (
        <ul className="mt-3 space-y-3 list-none p-0">
          {results.map((result) => (
            <li key={result.url}>
              <a
                href={result.url}
                className="block no-underline group"
              >
                <h4 className="text-gray-100 text-sm font-medium group-hover:text-sky-400 transition-colors">
                  {result.meta.title}
                </h4>
                <p
                  className="text-xs text-gray-500 mt-0.5 [&_mark]:bg-sky-400/20 [&_mark]:text-sky-300"
                  dangerouslySetInnerHTML={{ __html: result.excerpt }}
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      {query && !isLoading && results.length === 0 && (
        <p className="text-xs text-gray-600 mt-2">No results found.</p>
      )}
    </div>
  );
}
