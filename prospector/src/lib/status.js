/** Estados del CRM interno. El orden es el del embudo de ventas. */
export const LEAD_STATUSES = [
  { key: 'todo', label: 'Por contactar', dot: 'bg-zinc-400', pill: 'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700' },
  { key: 'sent', label: 'Mensaje enviado / En seguimiento', short: 'En seguimiento', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30' },
  { key: 'replied', label: 'Respondido / Interesado', short: 'Interesado', dot: 'bg-sky-500', pill: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30' },
  { key: 'meeting', label: 'Reunión / Propuesta enviada', short: 'Propuesta', dot: 'bg-violet-500', pill: 'bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30' },
  { key: 'won', label: 'Cliente Cerrado / ¡Ganado! 🎉', short: '¡Ganado! 🎉', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' },
  { key: 'lost', label: 'Descartado', dot: 'bg-rose-500', pill: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30' },
];

export const statusByKey = Object.fromEntries(LEAD_STATUSES.map((s) => [s.key, s]));

/** Días sin respuesta tras los que toca hacer seguimiento. */
export const FOLLOW_UP_DAYS = 3;

export function needsFollowUp(entry, now = Date.now()) {
  return entry?.status === 'sent' && now - entry.updatedAt >= FOLLOW_UP_DAYS * 86_400_000;
}

export function daysSince(ts, now = Date.now()) {
  return Math.floor((now - ts) / 86_400_000);
}

/** Clases Tailwind por tono (para badges de web y de problemas). */
export const TONE = {
  red: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
};
