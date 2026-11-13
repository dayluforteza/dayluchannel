/**
 * Backend de Prospector. Node puro, sin dependencias.
 *
 *   GET /api/health                              → { ok, provider }
 *   GET /api/search?niche=&location=&country=    → { source, results[] }
 *
 * Con GOOGLE_PLACES_API_KEY usa datos reales y audita cada web.
 * Sin clave, devuelve datos simulados. En producción también sirve /dist.
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize as normPath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateProspects } from '../shared/generator.js';
import { searchGooglePlaces } from './providers/googlePlaces.js';

try { process.loadEnvFile?.(); } catch { /* sin .env: modo simulado */ }

const PORT = Number(process.env.PORT) || 8787;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PAGESPEED_KEY = process.env.PAGESPEED_API_KEY;
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };

const json = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
};

async function handleSearch(url, res) {
  const q = {
    niche: (url.searchParams.get('niche') ?? '').slice(0, 80),
    location: (url.searchParams.get('location') ?? '').slice(0, 80),
    country: (url.searchParams.get('country') ?? 'ES').slice(0, 2).toUpperCase(),
  };
  if (!q.niche || !q.location) return json(res, 400, { error: 'Faltan nicho o ubicación.' });

  if (API_KEY) {
    try {
      const results = await searchGooglePlaces(q, { apiKey: API_KEY, pagespeedKey: PAGESPEED_KEY });
      return json(res, 200, { source: 'google', query: q, results });
    } catch (err) {
      console.error('[google]', err.message);
      return json(res, 502, { error: 'Error consultando Google Places. Revisa la clave y la cuota.' });
    }
  }
  await new Promise((r) => setTimeout(r, 700)); // latencia realista
  return json(res, 200, { source: 'mock', query: q, results: generateProspects(q) });
}

async function serveStatic(pathname, res) {
  const safe = normPath(pathname).replace(/^(\.\.[/\\])+/, '');
  let file = join(DIST, safe);
  try {
    if (!(await stat(file)).isFile()) throw new Error();
  } catch {
    file = join(DIST, 'index.html'); // fallback SPA
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Ejecuta "npm run build" o usa "npm run dev".');
  }
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/health') return json(res, 200, { ok: true, provider: API_KEY ? 'google' : 'mock' });
    if (url.pathname === '/api/search') return handleSearch(url, res);
    if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'No encontrado' });
    return serveStatic(url.pathname, res);
  })
  .listen(PORT, () => {
    console.log(`Prospector API → http://localhost:${PORT}  (proveedor: ${API_KEY ? 'Google Places' : 'datos simulados'})`);
  });
