# Server-side btgexplorer proxy + frontend search

What this adds
- An Express server (server.js) that serves static files from ./public
- An API endpoint GET /api/btg-search?q=... which proxies requests to btgexplorer.com server-to-server
- A search bar injected into index.html and a small frontend script (public/js/search.js) that calls the proxy
- Minimal CSS for the search UI (public/css/search.css)

Install and run locally
1. Install dependencies:
   npm install

2. Run the server (production-like):
   npm start
   - Opens an Express server on PORT (default 3000).
   - Visit http://localhost:3000 and use the search field at the top.

3. Continue using Vite for local development of the React app:
   npm run dev
   - The Express server is separate; you can run whichever mode you need.

Configuration
- To change the btgexplorer base URL, set environment variable:
  BTG_EXPLORER_BASE=https://btgexplorer.com npm start

Notes about Node fetch support
- server.js uses the global fetch API (Node 18+). If your runtime is older and doesn't provide fetch, either:
  - Install node-fetch (v2 or v3 as appropriate) and adjust server.js imports, or
  - Use undici and import fetch from 'undici'.

Security & Next steps
- The proxy currently forwards the full response body and content-type returned by btgexplorer. If you plan to render HTML responses inside your page, sanitize or parse them to avoid XSS or layout injection.
- If btgexplorer offers a JSON API endpoint, switching to that and returning structured JSON will result in a better UI.
- Consider caching frequent queries server-side (in-memory or Redis) to reduce latency and upstream load.

Integration note
- If you already run a backend server for this site, merge the /api/btg-search route into your existing server rather than running a second Express process.
