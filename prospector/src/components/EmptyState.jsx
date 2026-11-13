import { Radar, Send, KanbanSquare } from 'lucide-react';

const STEPS = [
  { icon: Radar, title: '1. Busca un nicho y una zona', text: 'Obtén negocios con teléfono, reseñas y una auditoría automática de su web.' },
  { icon: Send, title: '2. Pulsa «Comunicado»', text: 'Mensaje personalizado con los fallos reales de su web, listo para WhatsApp, email o LinkedIn.' },
  { icon: KanbanSquare, title: '3. Lleva el seguimiento', text: 'Cambia el estado de cada lead. Se guarda en tu navegador y te avisa cuando toca seguimiento.' },
];

export default function EmptyState() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {STEPS.map(({ icon: Icon, title, text }) => (
        <div key={title} className="card p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Icon className="h-5 w-5" /></span>
          <p className="mt-4 font-semibold">{title}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{text}</p>
        </div>
      ))}
    </div>
  );
}

/** Rejilla de carga con pasos de análisis simulados. */
export function LoadingGrid({ step }) {
  const STEPS = ['Consultando Google Maps…', 'Descargando fichas de negocio…', 'Auditando webs (HTTPS, móvil, SEO)…', 'Calculando oportunidad…'];
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="h-2 w-2 animate-ping rounded-full bg-indigo-500" /> {STEPS[step % STEPS.length]}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card space-y-3 p-4">
            <div className="flex justify-between"><div className="skeleton h-4 w-2/3" /><div className="skeleton h-10 w-10 rounded-full" /></div>
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-3 w-3/4" />
            <div className="skeleton h-16 w-full rounded-xl" />
            <div className="flex gap-1"><div className="skeleton h-5 w-20 rounded-full" /><div className="skeleton h-5 w-24 rounded-full" /></div>
            <div className="skeleton h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
