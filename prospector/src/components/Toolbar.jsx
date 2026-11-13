import { Download, Search } from 'lucide-react';
import { LEAD_STATUSES } from '../lib/status';

export const WEB_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'none', label: 'Sin web', hint: 'Oportunidad de oro', dot: 'bg-rose-500' },
  { key: 'outdated', label: 'Obsoleta / básica', dot: 'bg-amber-400' },
  { key: 'modern', label: 'Avanzada', dot: 'bg-emerald-500' },
];

/** Filtros instantáneos, orden y exportación. */
export default function Toolbar({ filters, setFilters, counts, onExport }) {
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="seg max-w-full overflow-x-auto">
        {WEB_FILTERS.map((f) => (
          <button key={f.key} className="seg-item" data-active={filters.web === f.key} onClick={() => set('web', f.key)} title={f.hint}>
            {f.dot && <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />}
            {f.label}
            <span className="tabular-nums text-xs text-zinc-400">{counts[f.key] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
        <div className="relative min-w-[180px] flex-1 lg:max-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input className="input py-2 pl-9" placeholder="Filtrar por nombre…" value={filters.text} onChange={(e) => set('text', e.target.value)} />
        </div>
        <select className="input w-auto py-2" value={filters.crm} onChange={(e) => set('crm', e.target.value)} aria-label="Estado CRM">
          <option value="all">Cualquier estado</option>
          {LEAD_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.short ?? s.label}</option>)}
        </select>
        <select className="input w-auto py-2" value={filters.sort} onChange={(e) => set('sort', e.target.value)} aria-label="Ordenar">
          <option value="score">Mayor oportunidad</option>
          <option value="rating">Mejor valoración</option>
          <option value="reviews">Más reseñas</option>
          <option value="name">Nombre A–Z</option>
        </select>
        <button className="btn-secondary py-2" onClick={onExport} title="Exportar CSV">
          <Download className="h-4 w-4" /> <span className="hidden sm:inline">CSV</span>
        </button>
      </div>
    </div>
  );
}
