import { AlertTriangle, BellRing, Copy, ExternalLink, Globe, MapPin, MessageSquareQuote, Phone, Send, Star } from 'lucide-react';
import { ISSUES, WEB_STATUS } from '../../shared/audit.js';
import { TONE, daysSince, needsFollowUp } from '../lib/status';
import StatusSelect from './StatusSelect';
import { useToast } from './Toast';

/** Tarjeta de negocio: datos, auditoría web, botón Comunicado y estado CRM. */
export default function ProspectCard({ lead, entry, onStatus, onOutreach, index = 0 }) {
  const toast = useToast();
  const ws = WEB_STATUS[lead.status];
  const due = needsFollowUp(entry);
  const visibleIssues = lead.issues.filter((i) => i !== 'NO_WEB');

  const copyPhone = async () => {
    try { await navigator.clipboard.writeText(lead.phone); toast('Teléfono copiado'); } catch { /* sin permiso */ }
  };

  return (
    <article
      className="card animate-pop-in group flex flex-col transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-900/[0.04] dark:hover:border-zinc-700"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      {/* Cabecera */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight" title={lead.name}>{lead.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            <Stars value={lead.rating} />
            <span className="font-medium tabular-nums">{lead.rating.toFixed(1).replace('.', ',')}</span>
            <span className="text-zinc-400">({lead.reviewCount} reseñas)</span>
          </div>
        </div>
        <ScoreRing score={lead.score} />
      </div>

      {/* Contacto */}
      <div className="space-y-1.5 px-4 text-sm text-zinc-600 dark:text-zinc-400">
        <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" /><span className="line-clamp-1" title={lead.address}>{lead.address}</span></p>
        {lead.phone && (
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-zinc-400" />
            <a href={`tel:${lead.phoneIntl ? `+${lead.phoneIntl}` : lead.phone}`} className="tabular-nums hover:text-indigo-600 dark:hover:text-indigo-400">{lead.phone}</a>
            <button onClick={copyPhone} className="text-zinc-400 opacity-0 transition hover:text-zinc-700 group-hover:opacity-100 dark:hover:text-zinc-200" aria-label="Copiar teléfono"><Copy className="h-3.5 w-3.5" /></button>
          </p>
        )}
      </div>

      {/* Reseña destacada */}
      {lead.featuredReview && (
        <blockquote className="mx-4 mt-3 rounded-xl bg-zinc-50 px-3 py-2.5 text-[13px] leading-relaxed text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-300">
          <MessageSquareQuote className="mb-1 h-3.5 w-3.5 text-zinc-400" />
          <p className="line-clamp-3">{lead.featuredReview.text}</p>
          <footer className="mt-1 text-xs text-zinc-400">— {lead.featuredReview.author}</footer>
        </blockquote>
      )}

      {/* Auditoría web */}
      <div className="mx-4 mt-3 border-t border-dashed border-zinc-200 pt-3 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-2">
          <span className={`badge ${TONE[ws.tone]}`}>
            {lead.status === 'none' ? <AlertTriangle className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
            {ws.label}
          </span>
          {lead.website && (
            <a href={lead.website} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1 text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400">
              <span className="truncate">{lead.web?.domain ?? lead.website}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}
        </div>
        {lead.status === 'none' ? (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Solo aparece en Google Maps. Oportunidad de oro.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1">
            {visibleIssues.length === 0 && <span className="text-xs text-zinc-500">Sin problemas graves. Ofrece SEO o mantenimiento.</span>}
            {visibleIssues.map((code) => (
              <span key={code} className={`badge ${TONE[ISSUES[code].tone]}`}>{ISSUES[code].label}</span>
            ))}
            {lead.web?.cms && <span className="badge bg-zinc-50 text-zinc-500 ring-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:ring-zinc-700">{lead.web.cms}</span>}
          </div>
        )}
      </div>

      {/* Acciones + CRM */}
      <div className="mt-auto space-y-2 p-4 pt-4">
        <div className="flex gap-2">
          <button onClick={() => onOutreach(lead)} className="btn-primary flex-1 py-2">
            <Send className="h-4 w-4" /> Comunicado
          </button>
          <a href={lead.mapsUrl} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-2" title="Ver en Google Maps">
            <MapPin className="h-4 w-4" />
          </a>
        </div>
        <StatusSelect value={entry?.status ?? 'todo'} onChange={(s) => onStatus(lead, s)} />
        {entry && entry.status !== 'todo' && (
          <p className={`flex items-center gap-1.5 text-[11px] ${due ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-zinc-400'}`}>
            {due && <BellRing className="h-3 w-3" />}
            {due ? `Toca seguimiento · hace ${daysSince(entry.updatedAt)} días` : `Actualizado ${relDays(entry.updatedAt)}`}
          </p>
        )}
      </div>
    </article>
  );
}

function relDays(ts) {
  const d = daysSince(ts);
  return d === 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`;
}

function Stars({ value }) {
  return (
    <span className="flex" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${value >= i - 0.25 ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'}`} />
      ))}
    </span>
  );
}

/** Anillo con la puntuación de oportunidad. */
function ScoreRing({ score }) {
  const r = 17, c = 2 * Math.PI * r;
  const color = score >= 75 ? 'text-indigo-500' : score >= 45 ? 'text-amber-500' : 'text-zinc-400';
  return (
    <div className="relative grid h-11 w-11 shrink-0 place-items-center" title="Puntuación de oportunidad (0–100)">
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r={r} className="fill-none stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="3.5" />
        <circle cx="20" cy="20" r={r} className={`fill-none stroke-current ${color}`} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className="text-xs font-semibold tabular-nums">{score}</span>
    </div>
  );
}
