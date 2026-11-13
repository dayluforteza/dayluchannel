/**
 * Generador de mensajes de outreach personalizados.
 * Construye el texto a partir de: datos del negocio, problemas detectados en su web,
 * la oferta del nicho y tu perfil (Ajustes).
 *
 * Es 100 % local (sin IA externa), así funciona gratis e instantáneo.
 * Si quieres reescribirlo con un LLM, pasa el resultado de `buildContext()` como prompt.
 */
import { resolveNiche, COUNTRIES } from '../../shared/niches.js';

/** Formas verbales: «vosotros» en España, «ustedes» en Latinoamérica/EE. UU. */
function forms(country) {
  const ust = COUNTRIES.find((c) => c.code === country)?.ustedes;
  return ust
    ? { os: 'les', Os: 'Les', vuestro: 'su', vuestra: 'su', teneis: 'tienen', ofreceis: 'ofrecen', veis: 'ven', decis: 'dicen', os_encaja: 'les encaja', hola: 'Hola' }
    : { os: 'os', Os: 'Os', vuestro: 'vuestro', vuestra: 'vuestra', teneis: 'tenéis', ofreceis: 'ofrecéis', veis: 'veis', decis: 'decís', os_encaja: 'os encaja', hola: 'Hola' };
}

/** Traduce cada problema técnico a impacto de negocio, en lenguaje del cliente. */
function issueSentence(code, lead, niche, f) {
  const w = lead.web ?? {};
  const zone = lead.zone;
  switch (code) {
    case 'NO_WEB':
      return `no ${f.teneis} página web propia: quien ${f.os} busca en Google solo ve la ficha de Maps, y muchos acaban llamando a la competencia que sí la tiene`;
    case 'WEB_DOWN':
      return `${f.vuestra} web no carga ahora mismo, así que quien entra desde Google se encuentra un error`;
    case 'NO_MOBILE':
      return `${f.vuestra} web no se adapta al móvil, y la mayoría de búsquedas de «${niche.searchExample}» se hacen desde el teléfono`;
    case 'NO_HTTPS':
      return 'Chrome marca la web como «No segura» (no tiene HTTPS), y eso hace que mucha gente se vaya antes de llamar';
    case 'DOMAIN_EXPIRING':
      return `el dominio ${w.domain ?? ''} caduca en ${w.domainExpiresDays} días; si no se renueva, la web y el correo dejan de funcionar`;
    case 'OLD_SITE':
      return `la web parece sin actualizar desde ${w.lastUpdateYear ?? 'hace años'}, y transmite una imagen más antigua que la de ${f.vuestro} servicio`;
    case 'NO_SEO':
      return `la web no tiene título ni descripción optimizados, así que Google no ${f.os} enseña cuando alguien busca «${niche.searchExample} en ${zone}»`;
    case 'SLOW':
      return `la web tarda en cargar en móvil${w.pageSpeed != null ? ` (${w.pageSpeed}/100 en PageSpeed)` : ''}, y cada segundo de espera hace perder visitas`;
    case 'NO_CTA':
      return 'no hay un botón de llamada o WhatsApp visible, y en móvil eso es lo que convierte la visita en cliente';
    default:
      return null;
  }
}

/** Reúne todo lo necesario para escribir el mensaje. */
export function buildContext(lead, settings, selectedIssues) {
  const niche = resolveNiche(lead.category);
  const f = forms(lead.country);
  const issues = (selectedIssues ?? lead.issues)
    .map((c) => issueSentence(c, lead, niche, f))
    .filter(Boolean);
  const offer = {
    ...niche.offer,
    title: niche.offer.title.replace('{zona}', lead.zone),
    detail: niche.offer.detail.replace('{zona}', lead.zone),
    hook: niche.offer.hook.replace('{zona}', lead.zone),
  };
  return { lead, niche, f, issues, offer, me: settings };
}

// Variantes de frases para que dos mensajes no salgan idénticos.
const OPENERS = {
  cercano: [
    (c) => `${c.f.hola}, ¿qué tal? Soy ${c.me.name}${c.me.role ? `, ${c.me.role}` : ''}${c.me.city ? ` en ${c.me.city}` : ''}.`,
    (c) => `${c.f.hola}, buenas. Me llamo ${c.me.name} y me dedico a ${c.me.role || 'hacer webs para negocios locales'}.`,
  ],
  profesional: [
    (c) => `Buenos días. Mi nombre es ${c.me.name}${c.me.role ? `, ${c.me.role}` : ''}.`,
    (c) => `Buenos días, equipo de ${c.lead.name}. ${c.f.Os} escribe ${c.me.name}${c.me.role ? `, ${c.me.role}` : ''}.`,
  ],
  directo: [
    (c) => `${c.f.hola}, soy ${c.me.name}. Voy al grano para no quitar${c.f.os} tiempo.`,
    (c) => `${c.f.hola}, ${c.me.name} por aquí. Dos minutos de lectura.`,
  ],
};

function compliment(c) {
  const { lead, niche, f } = c;
  if (lead.rating >= 4.3 && lead.reviewCount >= 15)
    return `He visto ${lead.name} en Google Maps: ${lead.rating.toFixed(1).replace('.', ',')} ★ con ${lead.reviewCount} reseñas, y destacan ${niche.compliment}.`;
  if (lead.featuredReview?.text)
    return `He estado mirando ${lead.name} en Google y me quedé con una reseña: «${truncate(lead.featuredReview.text, 90).replace(/[.!]+$/, '')}».`;
  return `He visto que ${f.ofreceis} servicio de ${niche.serviceNoun} en ${lead.zone}.`;
}

const CTAS = {
  cercano: [(c) => `¿${c.f.os_encaja.charAt(0).toUpperCase() + c.f.os_encaja.slice(1)} que ${c.f.os} mande un ejemplo de cómo quedaría? Sin compromiso.`, (c) => `¿${c.f.Os} mando una captura de cómo quedaría y lo ${c.f.veis} con calma?`],
  profesional: [(c) => `¿${c.f.Os} parece bien una llamada de 15 minutos esta semana para verlo juntos?`, (c) => `¿Qué día ${c.f.os} viene mejor para una llamada breve de 15 minutos?`],
  directo: [(c) => `¿${c.f.Os} lo enseño? Si no encaja, me lo ${c.f.decis} y no insisto.`, () => '¿Sí o no? Con un «no» me basta y no vuelvo a escribir.'],
};

/**
 * Genera el mensaje.
 * @returns {{subject?:string, body:string}}
 */
export function generateMessage({ lead, settings, channel = 'whatsapp', tone = 'cercano', variant = 0, selectedIssues }) {
  const c = buildContext(lead, settings, selectedIssues);
  const pick = (arr) => arr[variant % arr.length](c);
  const opener = pick(OPENERS[tone]);
  const cta = pick(CTAS[tone]);
  const top = c.issues.slice(0, channel === 'email' ? 4 : 2);
  const problem = top.length
    ? [`Buscando ${c.f.vuestro} negocio he visto que ${top[0]}.`, top[1] && `Además, ${top[1]}.`].filter(Boolean).join(' ')
    : `${c.f.vuestra.charAt(0).toUpperCase() + c.f.vuestra.slice(1)} web está bien hecha, pero creo que se puede sacar más partido al posicionamiento en ${lead.zone}.`;
  const offerLine = `Me dedico justo a esto: una ${lowerFirst(c.offer.title)}. ${c.offer.hook}`;
  const sig = signature(settings);

  if (channel === 'email') {
    const subject = pick([
      () => `${lead.name}: ${top.length ? 'he visto algo en vuestra web' : 'idea para captar más clientes'}`.replace('vuestra', c.f.vuestra),
      () => `Idea rápida para ${lead.name} en ${lead.zone}`,
    ]);
    const bullets = top.length ? `\n\nEsto es lo que he visto:\n${top.map((t) => `• ${capitalize(t)}.`).join('\n')}` : '';
    const body = [
      opener,
      compliment(c),
      top.length ? `Revisando ${c.f.vuestra} presencia online he encontrado algunos puntos que probablemente ${c.f.os} están costando clientes.${bullets}` : problem,
      `Mi propuesta: una ${lowerFirst(c.offer.title)}. ${c.offer.detail}`,
      c.offer.hook,
      cta,
      sig,
      `—\nSi no ${c.f.os} interesa, respondedme «no» y no vuelvo a escribir.`.replace('respondedme', c.f.os === 'os' ? 'respondedme' : 'respóndanme'),
    ].join('\n\n');
    return { subject, body };
  }

  if (channel === 'linkedin') {
    // Mensaje corto: las notas de conexión tienen límite de caracteres.
    const body = [
      `${c.f.hola}, soy ${settings.name}${settings.role ? `, ${settings.role}` : ''}.`,
      top.length ? `Mirando ${lead.name} he visto que ${top[0]}.` : `He visto ${lead.name} y tengo una idea para captar más clientes en ${lead.zone}.`,
      cta,
    ].join(' ');
    return { body };
  }

  // WhatsApp
  const body = [opener, compliment(c), problem, offerLine, cta, sig].join('\n\n');
  return { body };
}

function signature(s) {
  return [s.name, s.brand && s.brand !== s.name ? s.brand : null, s.web, s.phone].filter(Boolean).join(' · ');
}

/** URLs para abrir el canal con el texto ya escrito. */
export function channelLink(channel, lead, { subject, body }) {
  if (channel === 'whatsapp') return `https://wa.me/${lead.phoneIntl}?text=${encodeURIComponent(body)}`;
  if (channel === 'email') return `mailto:?subject=${encodeURIComponent(subject ?? '')}&body=${encodeURIComponent(body)}`;
  return `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(lead.name)}`;
}

const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
