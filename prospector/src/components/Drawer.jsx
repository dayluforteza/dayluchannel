import { useEffect } from 'react';
import { X } from 'lucide-react';

/** Panel lateral deslizante. Cierra con Esc o clic fuera. */
export default function Drawer({ open, onClose, title, subtitle, icon: Icon, width = 'max-w-xl', children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-fade-in absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside className={`animate-slide-in-right absolute inset-y-0 right-0 flex w-full ${width} flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950`}>
        <header className="flex items-start gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          {Icon && (
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Icon className="h-[18px] w-[18px]" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold">{title}</h2>
            {subtitle && <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
          </div>
          <button className="icon-btn -mr-2" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">{footer}</footer>}
      </aside>
    </div>
  );
}
