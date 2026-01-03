import React, { useEffect, useRef, useState } from "react";

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function parseHtmlResults(htmlText, query) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    // Try to extract common result structures
    const results = [];

    // 1) Look for article elements or .result/.search-result lists
    const candidateSelectors = [
      "article",
      ".result",
      ".search-result",
      "li",
      "div.result",
      "div.search-result",
    ];

    for (const sel of candidateSelectors) {
      const items = Array.from(doc.querySelectorAll(sel));
      if (items && items.length) {
        for (const item of items) {
          const a = item.querySelector("a[href]") || item.querySelector("a");
          const title = a ? (a.textContent || a.getAttribute("title") || a.href) : (item.querySelector("h1, h2, h3")?.textContent || item.textContent);
          const url = a ? a.href : undefined;
          const snippetEl = item.querySelector("p, .snippet, .summary");
          const snippet = snippetEl ? snippetEl.textContent.trim() : (item.textContent || "");
          if (title || url) {
            results.push({ title: (title || url || "(no title)").trim(), url, snippet: snippet.trim() });
          }
        }
        if (results.length) break;
      }
    }

    // 2) Fallback: collect top anchors
    if (!results.length) {
      const anchors = Array.from(doc.querySelectorAll("a[href]"));
      for (const a of anchors.slice(0, 20)) {
        const title = a.textContent.trim() || a.getAttribute("title") || a.href;
        results.push({ title, url: a.href, snippet: "" });
      }
    }

    // Optionally trim and dedupe
    const seen = new Set();
    const deduped = results
      .map(r => ({ title: r.title, url: r.url, snippet: r.snippet }))
      .filter(r => {
        const key = (r.url || r.title).toString();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return deduped;
  } catch (err) {
    console.error("parseHtmlResults error:", err);
    return [];
  }
}

function normalizeJsonResults(payload) {
  // Attempt to handle a few common JSON shapes.
  if (!payload) return [];
  if (Array.isArray(payload)) {
    // Assume array of items { title, url, snippet } or strings
    return payload.map((it) => {
      if (typeof it === "string") return { title: it, url: undefined, snippet: "" };
      return {
        title: it.title || it.name || it.heading || JSON.stringify(it),
        url: it.url || it.link || it.href,
        snippet: it.snippet || it.summary || it.description || "",
      };
    });
  }

  if (payload.results && Array.isArray(payload.results)) {
    return normalizeJsonResults(payload.results);
  }

  if (payload.items && Array.isArray(payload.items)) {
    return normalizeJsonResults(payload.items);
  }

  // If payload is an object representing a single result
  if (payload.title || payload.name) {
    return [
      {
        title: payload.title || payload.name,
        url: payload.url || payload.link || payload.href,
        snippet: payload.snippet || payload.summary || "",
      },
    ];
  }

  // Unknown structure: convert top-level keys to a single result
  return [
    {
      title: JSON.stringify(payload).slice(0, 200),
      url: undefined,
      snippet: "",
    },
  ];
}

export default function App() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    // Auto-search when debouncedQuery changes and is non-empty
    if (!debouncedQuery) return;
    doSearch(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  async function doSearch(q) {
    // Cancel previous
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setLastRequest(q);

    try {
      const url = "/api/btg-search?q=" + encodeURIComponent(q);
      const resp = await fetch(url, { signal: controller.signal, headers: { Accept: "*/*" } });

      if (!resp.ok) throw new Error(`Server returned ${resp.status}`);

      const contentType = resp.headers.get("content-type") || "";

      let parsed = [];

      if (contentType.includes("application/json")) {
        const json = await resp.json();
        parsed = normalizeJsonResults(json);
      } else {
        // Try to parse JSON first in case server mislabels content-type
        try {
          const json = await resp.clone().json();
          parsed = normalizeJsonResults(json);
        } catch (e) {
          // Not JSON: treat as HTML/text
          const text = await resp.text();
          parsed = parseHtmlResults(text, q);
        }
      }

      setResults(parsed);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error(err);
      setError(err.message || "Unknown error");
      setResults([]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function onSubmit(e) {
    if (e) e.preventDefault();
    if (!query) return;
    doSearch(query);
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>BTG Search</h1>
        <p style={{ marginTop: 6, color: "#666" }}>Search via your proxy endpoint (/api/btg-search)</p>
      </header>

      <form onSubmit={onSubmit} style={styles.form} role="search" aria-label="BTG search form">
        <input
          aria-label="Search query"
          placeholder="Search Bitcoin Gold..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading || !query}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div style={styles.metaRow}>
        {lastRequest && <div>Last query: <strong>{lastRequest}</strong></div>}
        {error && <div style={styles.error}>Error: {error}</div>}
      </div>

      <main style={styles.results}>
        {loading && !results.length && <div style={styles.center}>Loading results…</div>}

        {!loading && !results.length && lastRequest && !error && (
          <div style={styles.center}>No results found for "{lastRequest}".</div>
        )}

        {!results.length && !lastRequest && (
          <div style={styles.center}>Type a query to search Bitcoin Gold resources.</div>
        )}

        {results.length > 0 && (
          <ul style={styles.list} aria-live="polite">
            {results.map((r, idx) => (
              <li key={idx} style={styles.item}>
                <a href={r.url || "#"} target="_blank" rel="noopener noreferrer" style={styles.title}>
                  {r.title}
                </a>
                {r.url && <div style={styles.url}>{r.url}</div>}
                {r.snippet && <div style={styles.snippet}>{r.snippet}</div>}
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer style={styles.footer}>
        <small>Results are proxied through /api/btg-search on this host.</small>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    maxWidth: 900,
    margin: "24px auto",
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  form: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    fontSize: 16,
    border: "1px solid #ccc",
    borderRadius: 6,
  },
  button: {
    padding: "10px 14px",
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #1976d2",
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  error: {
    color: "#b00020",
  },
  results: {
    minHeight: 120,
  },
  center: {
    color: "#666",
    padding: 20,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 12,
  },
  item: {
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 8,
    background: "#fff",
  },
  title: {
    fontSize: 16,
    color: "#0b69ff",
    textDecoration: "none",
    fontWeight: 600,
  },
  url: {
    fontSize: 12,
    color: "#007700",
    marginTop: 6,
  },
  snippet: {
    marginTop: 8,
    color: "#333",
  },
  footer: {
    marginTop: 26,
    color: "#888",
  },
};
