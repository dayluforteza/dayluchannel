import { Briefcase, Globe2, Loader2, MapPin, Search } from 'lucide-react';
import { COUNTRIES, NICHES } from '../../shared/niches.js';

/** Panel superior: nicho + ubicación + país. */
export default function SearchPanel({ query, setQuery, onSearch, loading }) {
  const set = (k) => (e) => setQuery((q) => ({ ...q, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (query.niche.trim() && query.location.trim()) onSearch(query);
  };

  return (
    <form onSubmit={submit} className="card p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-[1.3fr_1.3fr_0.9fr_auto] md:items-end">
        <Field label="Nicho / Sector" icon={Briefcase}>
          <input className="input pl-9" list="niche-list" placeholder="Electricistas, clínicas dentales…" value={query.niche} onChange={set('niche')} required />
          <datalist id="niche-list">{NICHES.map((n) => <option key={n.key} value={n.label} />)}</datalist>
        </Field>
        <Field label="Ubicación / Zona" icon={MapPin}>
          <input className="input pl-9" placeholder="Málaga centro, Madrid, Miami FL…" value={query.location} onChange={set('location')} required />
        </Field>
        <Field label="País" icon={Globe2}>
          <select className="input appearance-none pl-9" value={query.country} onChange={set('country')}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
        </Field>
        <button className="btn-primary h-[42px] px-5" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? 'Analizando…' : 'Buscar / Analizar prospectos'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-zinc-400">Rápido:</span>
        {NICHES.slice(0, 7).map((n) => (
          <button
            key={n.key}
            type="button"
            onClick={() => setQuery((q) => ({ ...q, niche: n.label }))}
            className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-500/50 dark:hover:text-indigo-300"
          >
            {n.label}
          </button>
        ))}
      </div>
    </form>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        {children}
      </span>
    </label>
  );
}
