import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { LEAD_STATUSES, statusByKey } from '../lib/status';

/** Selector de estado del lead con colores. */
export default function StatusSelect({ value = 'todo', onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = statusByKey[value] ?? LEAD_STATUSES[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (compact) {
    // Versión nativa: no se recorta dentro de contenedores con scroll (Kanban).
    return (
      <label className={`relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset ${cur.pill}`}>
        <span className={`h-2 w-2 shrink-0 rounded-full ${cur.dot}`} />
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer appearance-none bg-transparent pr-4 outline-none" aria-label="Estado del lead">
          {LEAD_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.short ?? s.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 opacity-60" />
      </label>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset transition hover:brightness-[0.97] ${cur.pill}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${cur.dot}`} />
        <span className="truncate">{compact ? cur.short ?? cur.label : cur.label}</span>
        <ChevronDown className={`ml-auto h-3.5 w-3.5 shrink-0 opacity-60 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" className="animate-pop-in absolute bottom-full left-0 z-20 mb-1.5 w-full min-w-[230px] overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          {LEAD_STATUSES.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                role="option"
                aria-selected={s.key === value}
                onClick={() => { onChange(s.key); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                <span className="flex-1">{s.label}</span>
                {s.key === value && <Check className="h-3.5 w-3.5 text-indigo-500" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
