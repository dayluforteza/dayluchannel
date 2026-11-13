/**
 * Auditoría REAL de una web: descarga la portada y detecta problemas básicos.
 * Sin dependencias: usa fetch nativo de Node 18+.
 */
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Mobile Safari/537.36';

export async function auditUrl(rawUrl, { pagespeedKey } = {}) {
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `http://${rawUrl}`;
  const domain = new URL(url).hostname.replace(/^www\./, '');
  const base = { url, domain, reachable: false };

  let res, html;
  try {
    res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(9000) });
    html = (await res.text()).slice(0, 400_000);
  } catch {
    return base; // web caída, DNS roto o certificado inválido
  }
  if (!res.ok) return base;

  const finalUrl = res.url || url;
  const head = html.slice(0, 60_000);
  const years = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?((?:19|20)\d{2})/gi)].map((m) => +m[1]);
  const title = head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? '';
  const hasDesc = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{30,}/i.test(head);

  const web = {
    url: finalUrl,
    domain,
    reachable: true,
    https: finalUrl.startsWith('https://'),
    mobile: /<meta[^>]+name=["']viewport["']/i.test(head),
    seo: title.length >= 10 && hasDesc,
    lastUpdateYear: years.length ? Math.max(...years) : null,
    cta: /href=["'](?:tel:|https?:\/\/(?:wa\.me|api\.whatsapp\.com))/i.test(html),
    cms: head.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1] ?? null,
    pageSpeed: null,
    domainExpiresDays: null, // requiere WHOIS/RDAP; se deja fuera para no ralentizar
  };

  if (pagespeedKey) web.pageSpeed = await pageSpeed(finalUrl, pagespeedKey);
  return web;
}

async function pageSpeed(url, key) {
  try {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=${encodeURIComponent(url)}&key=${key}`;
    const r = await fetch(api, { signal: AbortSignal.timeout(45000) });
    const j = await r.json();
    const s = j?.lighthouseResult?.categories?.performance?.score;
    return s == null ? null : Math.round(s * 100);
  } catch {
    return null;
  }
}
