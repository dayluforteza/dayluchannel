/**
 * Proveedor REAL: Google Places API (New) · Text Search.
 * Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
 */
import { resolveNiche } from '../../shared/niches.js';
import { auditWeb } from '../../shared/audit.js';
import { hashString } from '../../shared/generator.js';
import { auditUrl } from './webAudit.js';

const FIELDS = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.nationalPhoneNumber',
  'places.internationalPhoneNumber', 'places.rating', 'places.userRatingCount', 'places.websiteUri',
  'places.googleMapsUri', 'places.reviews', 'places.businessStatus',
].join(',');

export async function searchGooglePlaces({ niche, location, country }, { apiKey, pagespeedKey }) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELDS },
    body: JSON.stringify({ textQuery: `${niche} en ${location}`, languageCode: 'es', regionCode: country, pageSize: 20 }),
  });
  if (!res.ok) throw new Error(`Google Places ${res.status}: ${await res.text()}`);
  const { places = [] } = await res.json();
  const nicheInfo = resolveNiche(niche);

  const active = places.filter((p) => p.businessStatus !== 'CLOSED_PERMANENTLY');
  const results = await mapLimit(active, 5, async (p) => {
    const web = p.websiteUri ? await auditUrl(p.websiteUri, { pagespeedKey }) : null;
    const biz = { rating: p.rating ?? 0, reviewCount: p.userRatingCount ?? 0 };
    const review = (p.reviews ?? []).filter((r) => r.text?.text).sort((a, b) => b.rating - a.rating)[0];
    return {
      id: `g_${hashString(p.id).toString(36)}`,
      name: p.displayName?.text ?? 'Sin nombre',
      category: nicheInfo.label,
      nicheKey: nicheInfo.key,
      address: p.formattedAddress ?? '',
      zone: location,
      country,
      phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? '',
      phoneIntl: (p.internationalPhoneNumber ?? '').replace(/\D/g, ''),
      ...biz,
      featuredReview: review
        ? { author: review.authorAttribution?.displayName ?? 'Cliente', rating: review.rating, text: review.text.text }
        : null,
      website: web?.url ?? null,
      web,
      ...auditWeb(web, biz),
      mapsUrl: p.googleMapsUri,
      source: 'google',
    };
  });
  return results.sort((a, b) => b.score - a.score);
}

/** Ejecuta `fn` sobre `items` con un máximo de `limit` tareas en paralelo. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  });
  await Promise.all(workers);
  return out;
}
