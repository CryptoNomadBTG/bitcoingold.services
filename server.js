import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static site from public/ (existing in repo)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Proxy endpoint for btgexplorer search.
 * - Performs server-to-server fetch to btgexplorer (not from browser).
 * - Configure BTG_EXPLORER_BASE env var to change target base URL (default: https://btgexplorer.com).
 *
 * Example:
 *   GET /api/btg-search?q=ADDRESS_OR_TX
 */
app.get('/api/btg-search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter `q`' });

  const base = process.env.BTG_EXPLORER_BASE || 'https://btgexplorer.com';
  const targetUrl = `${base.replace(/\/$/, '')}/search?q=${encodeURIComponent(q)}`;

  try {
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'bitcoingold.services-proxy/1.0 (+https://github.com/CryptoNomadBTG/bitcoingold.services)'
      }
    });

    const contentType = resp.headers.get('content-type') || 'text/plain';
    res.status(resp.status);
    res.set('Content-Type', contentType);

    const buffer = Buffer.from(await resp.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error('btg proxy error:', err);
    res.status(502).json({ error: 'Failed to fetch from btgexplorer', details: err.message });
  }
});

// Optionally serve index.html for unknown routes (uncomment if you want SPA fallback)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
//});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Proxy endpoint: GET /api/btg-search?q=... (targets: ${process.env.BTG_EXPLORER_BASE || 'https://btgexplorer.com'})`);
});
