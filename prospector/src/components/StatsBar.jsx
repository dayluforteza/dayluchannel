import { Ban, Gauge, Sparkles, Star, Target, TrendingDown } from 'lucide-react';

/** Resumen numérico de la búsqueda actual. */
export default function StatsBar({ results }) {
  const n = results.length || 1;
  const none = results.filter((r) => r.status === 'none').length;
  const old = results.filter((r) => r.status === 'outdated').length;
  const modern = results.length - none - old;
  const hot = results.filter((r) => r.score >= 75).length;
  const avg = results.reduce((a, r) => a + r.rating, 0) / n;

  const items = [
    { icon: Target, label: 'Prospectos', value: results.length, tone: 'text-zinc-900 dark:text-zinc-100' },
    { icon: Ban, label: 'Sin web', value: none, sub: `${Math.round((none / n) * 100)} %`, tone: 'text-rose-600 dark:text-rose-400' },
    { icon: TrendingDown, label: 'Web obsoleta', value: old, sub: `${Math.round((old / n) * 100)} %`, tone: 'text-amber-600 dark:text-amber-400' },
    { icon: Sparkles, label: 'Web moderna', value: modern, sub: `${Math.round((modern / n) * 100)} %`, tone: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Gauge, label: 'Oportunidad alta', value: hot, sub: 'score ≥ 75', tone: 'text-indigo-600 dark:text-indigo-400' },
    { icon: Star, label: 'Valoración media', value: avg.toFixed(1).replace('.', ','), tone: 'text-zinc-900 dark:text-zinc-100' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(({ icon: Icon, label, value, sub, tone }) => (
        <div key={label} className="card px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Icon className="h-3.5 w-3.5" /> {label}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-xl font-semibold tabular-nums ${tone}`}>{value}</span>
            {sub && <span className="text-xs text-zinc-400">{sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
