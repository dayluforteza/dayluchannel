import { BellRing, Inbox, Send, Trash2 } from 'lucide-react';
import { LEAD_STATUSES, needsFollowUp } from '../lib/status';
import StatusSelect from './StatusSelect';

/** Vista Kanban de todos los leads guardados (de cualquier búsqueda). */
export default function PipelineView({ leads, onStatus, onNote, onOutreach, onReset }) {
  const entries = Object.values(leads).sort((a, b) => b.updatedAt - a.updatedAt);
  if (entries.length === 0) {
    return (
      <div className="card grid place-items-center px-6 py-16 text-center">
        <Inbox className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="mt-3 font-medium">Tu pipeline está vacío</p>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">Cambia el estado de cualquier prospecto en los resultados y aparecerá aquí, aunque hagas otra búsqueda.</p>
      </div>
    );
  }
  const won = entries.filter((e) => e.status === 'won').length;
  const contacted = entries.filter((e) => e.status !== 'todo').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
        <p>
          {entries.length} leads · {contacted} contactados · {won} ganados
          {contacted > 0 && <> · conversión <b className="text-zinc-900 dark:text-zinc-100">{Math.round((won / contacted) * 100)} %</b></>}
        </p>
        <button className="btn-ghost py-1.5 text-xs" onClick={() => confirm('¿Borrar todo el pipeline? No se puede deshacer.') && onReset()}>
          <Trash2 className="h-3.5 w-3.5" /> Vaciar pipeline
        </button>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-6 xl:overflow-visible">
        {LEAD_STATUSES.map((s) => {
          const col = entries.filter((e) => e.status === s.key);
          return (
            <div key={s.key} className="w-[260px] shrink-0 snap-start xl:w-auto rounded-2xl bg-zinc-100/70 p-2 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                <span className="flex-1 truncate text-sm font-medium">{s.short ?? s.label}</span>
                <span className="text-xs tabular-nums text-zinc-400">{col.length}</span>
              </div>
              <div className="space-y-2">
                {col.map((e) => (
                  <div key={e.lead.id} className="card space-y-2 p-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.lead.name}</p>
                        <p className="truncate text-xs text-zinc-500">{e.lead.category} · {e.lead.zone}</p>
                      </div>
                      <button className="icon-btn h-7 w-7" title="Comunicado" onClick={() => onOutreach(e.lead)}><Send className="h-3.5 w-3.5" /></button>
                    </div>
                    {needsFollowUp(e) && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400"><BellRing className="h-3 w-3" /> Toca seguimiento</p>
                    )}
                    <textarea
                      className="input min-h-[52px] resize-none px-2.5 py-1.5 text-xs"
                      placeholder="Notas: con quién hablaste, precio…"
                      defaultValue={e.note}
                      onBlur={(ev) => ev.target.value !== e.note && onNote(e.lead, ev.target.value)}
                    />
                    <StatusSelect value={e.status} onChange={(st) => onStatus(e.lead, st)} compact />
                  </div>
                ))}
                {col.length === 0 && <p className="px-2 py-4 text-center text-xs text-zinc-400">—</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
