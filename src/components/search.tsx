import { useState, useRef, useCallback } from "react";
import styles from "./search.module.css";

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
    <div>
      <div className={styles.swSearchWrap}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search posts..."
          className={styles.swSearchInput}
        />
      </div>
      {isLoading && (
        <p className={styles.swSearchStatus}>Scanning archive...</p>
      )}
      {results.length > 0 && (
        <ul className={styles.swResultList}>
          {results.map((result) => (
            <li key={result.url} className={styles.swResultItem}>
              <a href={result.url}>
                <h4 className={styles.swResultTitle}>
                  {result.meta.title}
                </h4>
                <p
                  className={styles.swResultExcerpt}
                  dangerouslySetInnerHTML={{ __html: result.excerpt }}
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      {query && !isLoading && results.length === 0 && (
        <p className={styles.swSearchStatus}>No results found.</p>
      )}
    </div>
  );
}
