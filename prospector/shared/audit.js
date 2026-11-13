/**
 * Auditoría web: convierte los datos técnicos de una web en
 *  - un estado (none | outdated | modern),
 *  - una lista de problemas (badges),
 *  - una puntuación de oportunidad de 0 a 100.
 * La usan tanto el backend real como el generador de datos simulados.
 */

export const WEB_STATUS = {
  none: { label: 'Sin web', short: 'Sin web', tone: 'red' },
  outdated: { label: 'Web básica / antigua', short: 'Obsoleta', tone: 'amber' },
  modern: { label: 'Web moderna', short: 'Moderna', tone: 'emerald' },
};

/** Catálogo de problemas detectables. `weight` suma a la puntuación de oportunidad. */
export const ISSUES = {
  NO_WEB: { label: 'Sin página web', tone: 'red', weight: 0 },
  WEB_DOWN: { label: 'Web caída o inaccesible', tone: 'red', weight: 18 },
  NO_MOBILE: { label: 'No adaptada a móvil', tone: 'red', weight: 14 },
  NO_HTTPS: { label: 'Sin HTTPS («No seguro»)', tone: 'red', weight: 10 },
  DOMAIN_EXPIRING: { label: 'Dominio caduca pronto', tone: 'red', weight: 10 },
  OLD_SITE: { label: 'Web de hace +5 años', tone: 'amber', weight: 10 },
  NO_SEO: { label: 'Sin SEO básico', tone: 'amber', weight: 8 },
  SLOW: { label: 'Carga lenta en móvil', tone: 'amber', weight: 6 },
  NO_CTA: { label: 'Sin botón de llamada/WhatsApp', tone: 'amber', weight: 5 },
};

/**
 * @param {object|null} web  Datos técnicos de la web o null si no tiene.
 *   { url, reachable, https, mobile, seo, lastUpdateYear, pageSpeed, cta, domainExpiresDays, cms }
 * @param {object} biz { rating, reviewCount }
 */
export function auditWeb(web, biz = {}, now = new Date()) {
  const issues = [];
  let status;

  if (!web || !web.url) {
    status = 'none';
    issues.push('NO_WEB');
  } else if (web.reachable === false) {
    status = 'outdated';
    issues.push('WEB_DOWN');
  } else {
    if (web.mobile === false) issues.push('NO_MOBILE');
    if (web.https === false) issues.push('NO_HTTPS');
    if (web.domainExpiresDays != null && web.domainExpiresDays <= 45) issues.push('DOMAIN_EXPIRING');
    if (web.lastUpdateYear && now.getFullYear() - web.lastUpdateYear >= 5) issues.push('OLD_SITE');
    if (web.seo === false) issues.push('NO_SEO');
    if (web.pageSpeed != null && web.pageSpeed < 50) issues.push('SLOW');
    if (web.cta === false) issues.push('NO_CTA');

    const severe = issues.some((i) => ['NO_MOBILE', 'NO_HTTPS', 'OLD_SITE', 'WEB_DOWN'].includes(i));
    status = severe || issues.length >= 3 ? 'outdated' : 'modern';
  }

  return { status, issues, score: opportunityScore(status, issues, biz) };
}

/**
 * Puntuación de oportunidad. Prioriza negocios con clientes (buenas reseñas)
 * y presencia web pobre: tienen demanda, presupuesto y un problema claro.
 */
export function opportunityScore(status, issues, { rating = 0, reviewCount = 0 } = {}) {
  let s = { none: 55, outdated: 30, modern: 4 }[status];
  s += issues.reduce((acc, i) => acc + (ISSUES[i]?.weight ?? 0), 0);
  if (rating >= 4.5) s += 12; else if (rating >= 4.0) s += 7; else if (rating < 3.5) s -= 8;
  if (reviewCount >= 80) s += 10; else if (reviewCount >= 25) s += 5; else if (reviewCount < 8) s -= 5;
  return Math.max(1, Math.min(99, Math.round(s)));
}
