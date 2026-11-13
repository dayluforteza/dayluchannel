import { useCallback, useEffect, useMemo, useState } from 'react';
import { Database, KanbanSquare, LayoutGrid, Lightbulb, Moon, Radar, SearchX, Sun, UserCog } from 'lucide-react';
import SearchPanel from './components/SearchPanel';
import StatsBar from './components/StatsBar';
import Toolbar from './components/Toolbar';
import ProspectCard from './components/ProspectCard';
import OutreachDrawer from './components/OutreachDrawer';
import AdvisorPanel from './components/AdvisorPanel';
import PipelineView from './components/PipelineView';
import SettingsModal from './components/SettingsModal';
import EmptyState, { LoadingGrid } from './components/EmptyState';
import { useToast } from './components/Toast';
import { useLeads } from './hooks/useLeads';
import { useLocalState } from './hooks/useLocalState';
import { useTheme } from './hooks/useTheme';
import { searchProspects } from './services/api';
import { statusByKey, needsFollowUp } from './lib/status';
import { exportCsv } from './lib/csv';

const DEFAULT_SETTINGS = { name: 'Daylu Forteza', role: 'desarrollador web freelance', city: 'Málaga', brand: 'Daylu', web: 'daylu.es', phone: '' };
const DEFAULT_FILTERS = { web: 'all', crm: 'all', sort: 'score', text: '' };

export default function App() {
  const toast = useToast();
  const [theme, toggleTheme] = useTheme();
  const [settings, setSettings] = useLocalState('prospector.settings.v1', DEFAULT_SETTINGS);
  const [query, setQuery] = useLocalState('prospector.query.v1', { niche: '', location: '', country: 'ES' });
  const [search, setSearch] = useLocalState('prospector.lastSearch.v1', null); // { source, query, results }
  const { leads, setStatus, setNote, reset } = useLeads();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('results');
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState(null);
  const [outreachLead, setOutreachLead] = useState(null);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const results = search?.results ?? [];

  // Pasos de "análisis" mientras carga.
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadStep((s) => s + 1), 650);
    return () => clearInterval(t);
  }, [loading]);

  const runSearch = useCallback(async (q) => {
    setLoading(true);
    setLoadStep(0);
    setError(null);
    setView('results');
    try {
      const data = await searchProspects(q);
      setSearch(data);
      setFilters(DEFAULT_FILTERS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setSearch]);

  const counts = useMemo(() => ({
    all: results.length,
    none: results.filter((r) => r.status === 'none').length,
    outdated: results.filter((r) => r.status === 'outdated').length,
    modern: results.filter((r) => r.status === 'modern').length,
  }), [results]);

  const visible = useMemo(() => {
    const text = filters.text.trim().toLowerCase();
    const list = results.filter((r) =>
      (filters.web === 'all' || r.status === filters.web) &&
      (filters.crm === 'all' || (leads[r.id]?.status ?? 'todo') === filters.crm) &&
      (!text || r.name.toLowerCase().includes(text)));
    const sorters = {
      score: (a, b) => b.score - a.score,
      rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      reviews: (a, b) => b.reviewCount - a.reviewCount,
      name: (a, b) => a.name.localeCompare(b.name, 'es'),
    };
    return [...list].sort(sorters[filters.sort]);
  }, [results, filters, leads]);

  const pipelineCount = Object.keys(leads).length;
  const dueCount = Object.values(leads).filter((e) => needsFollowUp(e)).length;

  const handleStatus = useCallback((lead, status) => {
    setStatus(lead, status);
    if (status === 'won') toast('¡Cliente ganado! 🎉');
    else toast(`Estado: ${statusByKey[status].short ?? statusByKey[status].label}`);
  }, [setStatus, toast]);

  return (
    <div className="min-h-screen">
      {/* Cabecera */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"><Radar className="h-4 w-4" /></span>
            <span className="font-semibold tracking-tight">Prospector</span>
            <span className="hidden rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 sm:inline dark:bg-zinc-800">Privado</span>
          </div>

          <nav className="seg ml-2 sm:ml-6">
            <button className="seg-item" data-active={view === 'results'} onClick={() => setView('results')}>
              <LayoutGrid className="h-4 w-4" /> <span className="hidden sm:inline">Resultados</span>
            </button>
            <button className="seg-item" data-active={view === 'pipeline'} onClick={() => setView('pipeline')}>
              <KanbanSquare className="h-4 w-4" /> <span className="hidden sm:inline">Pipeline</span>
              {pipelineCount > 0 && <span className="text-xs tabular-nums text-zinc-400">{pipelineCount}</span>}
              {dueCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title={`${dueCount} seguimientos pendientes`} />}
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button className="btn-secondary py-1.5" onClick={() => setAdvisorOpen(true)}>
              <Lightbulb className="h-4 w-4 text-amber-500" /> <span className="hidden md:inline">Asesor de Captación</span>
            </button>
            <button className="icon-btn" onClick={() => setSettingsOpen(true)} aria-label="Ajustes"><UserCog className="h-4 w-4" /></button>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Cambiar tema">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6">
        {view === 'results' ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Encuentra negocios que necesitan una web</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Busca un sector y una zona. La herramienta audita su web y te dice a quién llamar primero.</p>
            </div>

            <SearchPanel query={query} setQuery={setQuery} onSearch={runSearch} loading={loading} />

            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

            {loading ? (
              <LoadingGrid step={loadStep} />
            ) : results.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm text-zinc-500">
                    <b className="font-semibold text-zinc-900 dark:text-zinc-100">{search.query.niche}</b> en <b className="font-semibold text-zinc-900 dark:text-zinc-100">{search.query.location}</b>
                  </h2>
                  <SourceBadge source={search.source} />
                </div>
                <StatsBar results={results} />
                <Toolbar filters={filters} setFilters={setFilters} counts={counts} onExport={() => exportCsv(visible, leads)} />

                {visible.length === 0 ? (
                  <div className="card grid place-items-center py-14 text-center">
                    <SearchX className="h-7 w-7 text-zinc-300 dark:text-zinc-700" />
                    <p className="mt-2 text-sm text-zinc-500">Ningún negocio con estos filtros.</p>
                    <button className="btn-ghost mt-2 text-sm" onClick={() => setFilters(DEFAULT_FILTERS)}>Quitar filtros</button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((lead, i) => (
                      <ProspectCard key={lead.id} index={i} lead={lead} entry={leads[lead.id]} onStatus={handleStatus} onOutreach={setOutreachLead} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Pipeline de ventas</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Todos tus leads, de cualquier búsqueda. Se guardan en este navegador.</p>
            </div>
            <PipelineView leads={leads} onStatus={handleStatus} onNote={setNote} onOutreach={setOutreachLead} onReset={reset} />
          </>
        )}
      </main>

      {outreachLead && (
        <OutreachDrawer
          key={outreachLead.id}
          lead={outreachLead}
          settings={settings}
          onClose={() => setOutreachLead(null)}
          onMarkSent={(l) => setStatus(l, 'sent')}
          onOpenSettings={() => { setOutreachLead(null); setSettingsOpen(true); }}
        />
      )}
      <AdvisorPanel
        open={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
        results={results}
        query={search?.query ?? query}
        leads={leads}
        onOutreach={(l) => { setAdvisorOpen(false); setOutreachLead(l); }}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} setSettings={setSettings} />
    </div>
  );
}

function SourceBadge({ source }) {
  const real = source === 'google';
  return (
    <span className={`badge ${real ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25' : 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700'}`}
      title={real ? 'Datos reales de Google Places + auditoría web real' : 'Configura GOOGLE_PLACES_API_KEY en .env para datos reales'}>
      <Database className="h-3 w-3" /> {real ? 'Google Places · datos reales' : 'Datos simulados'}
    </span>
  );
}
