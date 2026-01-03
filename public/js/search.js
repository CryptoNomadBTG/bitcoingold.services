// Frontend code that calls our server-side proxy (server-to-server fetch).
// It fetches from /api/btg-search?q=... and displays the raw response.
// Adjust display parsing to suit the actual btgexplorer response format (JSON or HTML).

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('btg-search-form');
  const input = document.getElementById('btg-search-input');
  const btn = document.getElementById('btg-search-btn');

  // create a results area under the header if not present
  let results = document.getElementById('search-results');
  if (!results) {
    results = document.createElement('section');
    results.id = 'search-results';
    results.className = 'search-results';
    const root = document.getElementById('root');
    root.parentNode.insertBefore(results, root.nextSibling);
  }

  async function runSearch(query) {
    if (!query) {
      results.textContent = 'Please enter a search term.';
      return;
    }

    results.textContent = 'Searching...';
    results.style.color = '';

    try {
      const res = await fetch(`/api/btg-search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/html, text/plain'
        }
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        results.textContent = JSON.stringify(json, null, 2);
      } else {
        const text = await res.text();
        // We display raw text for safety. If the upstream returns HTML and you want to render it,
        // parse and sanitize server-side or client-side before injecting into the DOM.
        results.textContent = text;
      }

      if (!res.ok) {
        results.style.color = 'crimson';
      } else {
        results.style.color = '';
      }
    } catch (err) {
      results.textContent = 'Request failed: ' + err.message;
      results.style.color = 'crimson';
    }
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    runSearch(input.value.trim());
  });

  btn.addEventListener('click', () => {
    runSearch(input.value.trim());
  });

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      runSearch(input.value.trim());
    }
  });
});
