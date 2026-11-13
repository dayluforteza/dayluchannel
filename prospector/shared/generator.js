/**
 * Generador de prospectos SIMULADOS pero realistas.
 * Es determinista: la misma búsqueda (nicho + zona + país) devuelve siempre los mismos
 * negocios con los mismos IDs, así los estados del CRM se mantienen entre búsquedas.
 */
import { resolveNiche, COUNTRIES, normalize } from './niches.js';
import { auditWeb } from './audit.js';

// ── PRNG con semilla ────────────────────────────────────────────────────────
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed;
  const next = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    digits: (n) => Array.from({ length: n }, () => Math.floor(next() * 10)).join(''),
  };
}

// ── Datos de apoyo ──────────────────────────────────────────────────────────
const SURNAMES = ['García', 'Martín', 'López', 'Sánchez', 'Romero', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Serrano', 'Molina', 'Ortega', 'Delgado', 'Castro', 'Ruiz', 'Moreno', 'Jiménez', 'Herrera', 'Medina', 'Cortés', 'Prieto', 'Vega'];
const FIRST = ['Lucía', 'Carmen', 'Marta', 'Elena', 'Paula', 'Javier', 'Antonio', 'Manuel', 'Pablo', 'Sergio', 'Raúl', 'Laura', 'Rocío', 'Álvaro', 'Nuria', 'Diego'];
const WORDS = ['Sur', 'Norte', 'Plus', 'Express', 'Pro', 'Sol', 'Mar', 'Luz', 'Nova', 'Centro', 'Vital', 'Prime', 'Total', 'Atlántico', 'Mediterráneo'];
const STREETS = {
  ES: ['Calle Mayor', 'Avenida de Andalucía', 'Calle Real', 'Paseo de la Estación', 'Calle San Juan', 'Avenida de Europa', 'Calle del Carmen', 'Plaza de España', 'Calle Nueva', 'Calle Granada', 'Avenida de la Constitución', 'Calle Cervantes'],
  MX: ['Av. Insurgentes Sur', 'Calle Morelos', 'Av. Juárez', 'Calle Hidalgo', 'Av. Reforma', 'Calle 5 de Mayo', 'Av. Revolución'],
  US: ['NW 7th St', 'Biscayne Blvd', 'SW 8th St', 'Coral Way', 'Flagler St', 'Collins Ave', 'Main St'],
  AR: ['Av. Corrientes', 'Av. Santa Fe', 'Calle Florida', 'Av. Rivadavia', 'Av. Cabildo'],
  CO: ['Calle 72', 'Carrera 7', 'Av. Boyacá', 'Calle 26', 'Carrera 15'],
  CL: ['Av. Providencia', 'Av. Apoquindo', 'Calle Merced', 'Av. Libertador B. O\'Higgins'],
};
const OLD_CMS = ['WordPress 4.x', 'Joomla 2.5', 'HTML estático', 'Wix (plantilla antigua)', 'Ficha de Páginas Amarillas', 'Plantilla de hosting'];
const NEW_CMS = ['WordPress 6', 'Webflow', 'Next.js', 'Wix Studio', 'Framer', 'Shopify'];

function phoneFor(country, r) {
  switch (country) {
    case 'ES': { const n = (r.chance(0.6) ? '6' : '9') + r.digits(8); return { display: `${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}`, intl: `34${n}` }; }
    case 'MX': { const n = '55' + r.digits(8); return { display: `+52 ${n.slice(0, 2)} ${n.slice(2, 6)} ${n.slice(6)}`, intl: `52${n}` }; }
    case 'US': { const n = '305' + r.digits(7); return { display: `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`, intl: `1${n}` }; }
    case 'AR': { const n = '11' + r.digits(8); return { display: `+54 ${n.slice(0, 2)} ${n.slice(2, 6)}-${n.slice(6)}`, intl: `549${n}` }; }
    case 'CO': { const n = '3' + r.digits(9); return { display: `+57 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`, intl: `57${n}` }; }
    default: { const n = '9' + r.digits(8); return { display: `+56 ${n.slice(0, 1)} ${n.slice(1, 5)} ${n.slice(5)}`, intl: `56${n}` }; }
  }
}

export function slugify(s) {
  return normalize(s).replace(/&/g, 'y').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function makeName(niche, r, place) {
  const tpl = r.pick(niche.names);
  return tpl
    .replace('{surname2}', r.pick(SURNAMES))
    .replace('{surname}', r.pick(SURNAMES))
    .replace('{first}', r.pick(FIRST))
    .replace('{word}', r.pick(WORDS))
    .replace('{place}', place);
}

/** Datos técnicos de la web según el "perfil" asignado. */
function makeWeb(kind, name, country, r, year) {
  if (kind === 'none') return null;
  const tld = COUNTRIES.find((c) => c.code === country)?.tld ?? '.com';
  const domain = slugify(name).replace(/-/g, '').slice(0, 22) + tld;
  if (kind === 'outdated') {
    const https = r.chance(0.45);
    return {
      url: `${https ? 'https' : 'http'}://www.${domain}`,
      domain,
      reachable: !r.chance(0.06),
      https,
      mobile: r.chance(0.3),
      seo: r.chance(0.3),
      lastUpdateYear: r.int(year - 13, year - 3),
      pageSpeed: r.int(12, 55),
      cta: r.chance(0.25),
      cms: r.pick(OLD_CMS),
      domainExpiresDays: r.chance(0.15) ? r.int(4, 40) : r.int(90, 700),
    };
  }
  return {
    url: `https://${domain}`,
    domain,
    reachable: true,
    https: true,
    mobile: true,
    seo: r.chance(0.8),
    lastUpdateYear: r.int(year - 2, year),
    pageSpeed: r.int(58, 98),
    cta: r.chance(0.8),
    cms: r.pick(NEW_CMS),
    domainExpiresDays: r.int(120, 900),
  };
}

/**
 * Genera la lista de prospectos simulados.
 * @param {{niche:string, location:string, country:string}} q
 */
export function generateProspects({ niche: rawNiche = '', location = '', country = 'ES' }) {
  const niche = resolveNiche(rawNiche);
  const zone = location.trim() || 'tu zona';
  const place = zone.split(/[ ,]/)[0];
  const r = rng(hashString(`${normalize(rawNiche)}|${normalize(zone)}|${country}`));
  const year = new Date().getFullYear();
  const count = r.int(16, 24);
  const used = new Set();
  const results = [];

  for (let i = 0; i < count; i++) {
    let name = makeName(niche, r, place);
    if (used.has(name)) name = `${name} ${r.pick(WORDS)}`;
    used.add(name);

    // Reparto aproximado del mercado local: ~30 % sin web, ~42 % obsoleta, ~28 % moderna.
    const roll = r.next();
    const kind = roll < 0.3 ? 'none' : roll < 0.72 ? 'outdated' : 'modern';

    const rating = Math.round((3.4 + r.next() * 1.6) * 10) / 10;
    const reviewCount = kind === 'modern' ? r.int(30, 420) : r.int(3, 190);
    const phone = phoneFor(country, r);
    const web = makeWeb(kind, name, country, r, year);
    const audit = auditWeb(web, { rating, reviewCount });

    results.push({
      id: `p_${hashString(`${name}|${normalize(zone)}|${country}`).toString(36)}`,
      name,
      category: niche.label,
      nicheKey: niche.key,
      address: `${r.pick(STREETS[country] ?? STREETS.ES)}, ${r.int(1, 140)} · ${zone}`,
      zone,
      country,
      phone: phone.display,
      phoneIntl: phone.intl,
      rating: Math.min(rating, 5),
      reviewCount,
      featuredReview: {
        author: `${r.pick(FIRST)} ${r.pick(SURNAMES).charAt(0)}.`,
        rating: Math.max(4, Math.round(rating)),
        text: r.pick(niche.reviews),
      },
      website: web?.url ?? null,
      web,
      ...audit,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${zone}`)}`,
      source: 'mock',
    });
  }
  return results.sort((a, b) => b.score - a.score);
}
