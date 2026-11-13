import { useState } from 'react';
import { BellRing, CalendarClock, ChevronDown, Clock, Crosshair, Gift, Lightbulb, MessagesSquare, Scale, Send, ShieldAlert, TrendingUp } from 'lucide-react';
import { ISSUES } from '../../shared/audit.js';
import { FOLLOW_UP, resolveNiche } from '../../shared/niches.js';
import { needsFollowUp } from '../lib/status';
import Drawer from './Drawer';

/** Asesor de Captación & Growth: analiza la búsqueda actual y da tácticas concretas. */
export default function AdvisorPanel({ open, onClose, results, query, leads, onOutreach }) {
  if (!open) return null;
  const niche = resolveNiche(query.niche);
  const zone = query.location || 'tu zona';
  const has = results.length > 0;
  const fill = (s) => s.replaceAll('{zona}', zone);

  // ── Análisis de la búsqueda ──
  const n = results.length || 1;
  const none = results.filter((r) => r.status === 'none');
  const old = results.filter((r) => r.status === 'outdated');
  const goldNoWeb = none.filter((r) => r.rating >= 4.3 && r.reviewCount >= 20);
  const issueCount = {};
  results.forEach((r) => r.issues.forEach((i) => i !== 'NO_WEB' && (issueCount[i] = (issueCount[i] ?? 0) + 1)));
  const topIssues = Object.entries(issueCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const priority = results.filter((r) => !leads[r.id] || leads[r.id].status === 'todo').slice(0, 5);
  const hot = results.filter((r) => r.score >= 60).length;
  const minPrice = Number((niche.offer.price.match(/[\d.]+/)?.[0] ?? '450').replace('.', ''));

  // ── Pipeline global ──
  const entries = Object.values(leads);
  const due = entries.filter((e) => needsFollowUp(e)).length;
  const active = entries.filter((e) => ['sent', 'replied', 'meeting'].includes(e.status)).length;
  const won = entries.filter((e) => e.status === 'won').length;

  return (
    <Drawer open onClose={onClose} icon={Lightbulb} title="Asesor de Captación & Growth" subtitle={`${niche.label} · ${zone}`} width="max-w-2xl">
      <div className="space-y-3">
        {/* Diagnóstico */}
        {has ? (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-600/20">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-100">Diagnóstico de esta búsqueda</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">
              {Math.round((none.length / n) * 100)} % de los {results.length} negocios no tiene web y {Math.round((old.length / n) * 100)} % la tiene obsoleta.
              {goldNoWeb.length > 0
                ? ` Empieza por los ${goldNoWeb.length} sin web con ≥ 4,3 ★ y 20+ reseñas: tienen clientes, presupuesto y ningún canal propio.`
                : ' Empieza por las webs obsoletas con más reseñas: es donde el problema es más visible.'}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Kpi label="Score ≥ 60" value={hot} />
              <Kpi label="Seguimientos hoy" value={due} />
              <Kpi label="Ganados" value={won} />
            </div>
            {hot > 0 && (
              <p className="mt-3 text-xs text-indigo-100">
                Estimación conservadora: si contactas los {hot} con score ≥ 60 y cierras 1 de cada 20, son ~{Math.max(1, Math.round(hot / 20))} cliente(s) ≈ {(Math.max(1, Math.round(hot / 20)) * minPrice).toLocaleString('es-ES')} € de entrada + cuota mensual.
              </p>
            )}
          </div>
        ) : (
          <p className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">Haz una búsqueda para ver el diagnóstico con datos. Abajo tienes la estrategia del nicho.</p>
        )}

        {has && priority.length > 0 && (
          <Section icon={Crosshair} title="Contacta hoy, en este orden" defaultOpen>
            <ol className="space-y-1.5">
              {priority.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-zinc-500">{p.rating.toFixed(1).replace('.', ',')} ★ · {p.reviewCount} reseñas · {p.status === 'none' ? 'sin web' : p.issues.slice(0, 2).map((c) => lowerFirst(ISSUES[c].label)).join(', ')}</p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">{p.score}</span>
                  <button className="btn-secondary px-2.5 py-1.5 text-xs" onClick={() => onOutreach(p)}><Send className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ol>
            {topIssues.length > 0 && (
              <p className="mt-3 text-xs text-zinc-500">
                Problemas más repetidos en la zona: {topIssues.map(([c, k]) => `${lowerFirst(ISSUES[c].label)} (${k})`).join(' · ')}. Úsalos como argumento: «al {Math.round((topIssues[0][1] / n) * 100)} % de negocios de tu sector en {zone} les pasa lo mismo».
              </p>
            )}
          </Section>
        )}

        <Section icon={ShieldAlert} title="Argumentos de venta (pain points)" defaultOpen={!has}>
          <ul className="space-y-3">
            {niche.painPoints.map((p) => (
              <li key={p.title}>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{fill(p.detail)}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Gift} title="Oferta irresistible">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/5">
            <p className="font-medium">{fill(niche.offer.title)}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{fill(niche.offer.detail)}</p>
            <p className="mt-2 text-sm"><b>Gancho:</b> {fill(niche.offer.hook)}</p>
            <p className="mt-1 text-sm"><b>Precio orientativo (España):</b> {niche.offer.price}</p>
          </div>
          <p className="mt-2 text-xs text-zinc-500">La cuota mensual es lo que te da ingresos estables: 10 clientes × 29 € = 290 €/mes recurrentes.</p>
        </Section>

        <Section icon={MessagesSquare} title="Objeciones y cómo responder">
          <ul className="space-y-2.5">
            {niche.objections.map((o) => (
              <li key={o.q} className="text-sm">
                <p className="font-medium">{o.q}</p>
                <p className="text-zinc-600 dark:text-zinc-400">→ {o.a}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={CalendarClock} title="Estrategia de seguimiento">
          {(due > 0 || active > 0) && (
            <p className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              <BellRing className="h-4 w-4" /> {due} lead(s) llevan 3+ días sin respuesta · {active} activos en el pipeline.
            </p>
          )}
          <ol className="relative space-y-3 border-l border-zinc-200 pl-4 dark:border-zinc-800">
            {FOLLOW_UP.map((s) => (
              <li key={s.day} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-500 dark:border-zinc-950" />
                <p className="text-sm font-medium">Día {s.day} · <span className="font-normal text-zinc-500">{s.channel}</span></p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.action}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex items-start gap-2 text-sm"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" /> <span><b>Mejor hora para {niche.label.toLowerCase()}:</b> {niche.bestTime}</span></p>
        </Section>

        <Section icon={TrendingUp} title="Táctica de cierre">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Lleva la maqueta hecha con su nombre, sus reseñas y su teléfono. Ver su negocio «ya funcionando» cierra más que cualquier argumento.</li>
            <li>Enseña su web en tu móvil al lado de la de un competidor bien posicionado.</li>
            <li>Ofrece pago en 2 partes (50 % al empezar, 50 % al publicar) y cuota mensual sin permanencia.</li>
            <li>Pide reseña en Google y 2 referidos a cada cliente cerrado: el siguiente cliente del mismo nicho es el más fácil.</li>
          </ul>
        </Section>

        <Section icon={Scale} title="Hazlo legal (España)">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>La LSSI (art. 21) prohíbe enviar publicidad por email o mensajería sin consentimiento previo, también a empresas. Multas de hasta 30.000 € (leve) o 150.000 € (envío masivo).</li>
            <li>Lo más seguro y lo que más convierte: llama o pásate por el negocio, preséntate y pregunta «¿te lo mando por WhatsApp?». Con ese «sí», envías el mensaje.</li>
            <li>Identifícate siempre (nombre y web) y respeta un «no»: márcalo como Descartado.</li>
            <li>Guarda solo datos públicos del negocio y borra los descartados pasado un tiempo (RGPD).</li>
          </ul>
        </Section>
      </div>
    </Drawer>
  );
}

const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

function Kpi({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 px-2 py-2">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-indigo-100">{label}</p>
    </div>
  );
}

function Section({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="card overflow-hidden">
      <button className="flex w-full items-center gap-2.5 px-4 py-3 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Icon className="h-4 w-4 text-indigo-500" />
        <span className="flex-1 text-sm font-semibold">{title}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="animate-fade-in border-t border-zinc-100 px-4 py-3.5 dark:border-zinc-800">{children}</div>}
    </section>
  );
}
