import { useMemo, useState } from 'react';
import { Check, Copy, Linkedin, Mail, MessageCircle, RefreshCw, Send, Sparkles } from 'lucide-react';
import { ISSUES } from '../../shared/audit.js';
import { channelLink, generateMessage } from '../lib/outreach';
import { TONE } from '../lib/status';
import Drawer from './Drawer';
import { useToast } from './Toast';

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, open: 'Abrir en WhatsApp' },
  { key: 'email', label: 'Email', icon: Mail, open: 'Abrir en mi correo' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, open: 'Buscar en LinkedIn' },
];
const TONES = [
  { key: 'cercano', label: 'Cercano' },
  { key: 'profesional', label: 'Profesional' },
  { key: 'directo', label: 'Directo' },
];
const LINKEDIN_LIMIT = 300; // límite de la nota de invitación

/** Generador de mensajes de outreach personalizados para un prospecto. */
export default function OutreachDrawer({ lead, settings, onClose, onMarkSent, onOpenSettings }) {
  const toast = useToast();
  const [channel, setChannelRaw] = useState(lead.phoneIntl ? 'whatsapp' : 'email');
  const [tone, setToneRaw] = useState('cercano');
  const [variant, setVariantRaw] = useState(0);
  const [selected, setSelectedRaw] = useState(lead.issues);
  // Edición manual del texto. Se descarta al cambiar canal, tono, variante o problemas.
  const [edit, setEdit] = useState(null);
  const reset = (fn) => (v) => { setEdit(null); fn(v); };
  const setChannel = reset(setChannelRaw);
  const setTone = reset(setToneRaw);
  const setVariant = reset(setVariantRaw);
  const setSelected = reset(setSelectedRaw);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(
    () => generateMessage({ lead, settings, channel, tone, variant, selectedIssues: selected }),
    [lead, settings, channel, tone, variant, selected],
  );
  const subject = edit?.subject ?? generated.subject ?? '';
  const body = edit?.body ?? generated.body;
  const setSubject = (v) => setEdit({ subject: v, body });
  const setBody = (v) => setEdit({ subject, body: v });

  const toggleIssue = (code) =>
    setSelected((s) => (s.includes(code) ? s.filter((c) => c !== code) : [...s, code]));

  const copy = async () => {
    const text = channel === 'email' ? `Asunto: ${subject}\n\n${body}` : body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast('Mensaje copiado al portapapeles');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('No se pudo copiar: selecciona el texto manualmente');
    }
  };

  const openChannel = () => {
    if (channel === 'linkedin') copy();
    window.open(channelLink(channel, lead, { subject, body }), '_blank', 'noopener');
  };

  const ch = CHANNELS.find((c) => c.key === channel);
  const overLimit = channel === 'linkedin' && body.length > LINKEDIN_LIMIT;
  const profileIncomplete = !settings.name || settings.name === 'Tu nombre';

  return (
    <Drawer
      open
      onClose={onClose}
      icon={Sparkles}
      title={`Comunicado · ${lead.name}`}
      subtitle={`${lead.category} · ${lead.zone}`}
      footer={
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary flex-1" onClick={copy}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            Copiar mensaje
          </button>
          <button className="btn-primary flex-1" onClick={openChannel} disabled={channel === 'whatsapp' && !lead.phoneIntl}>
            <ch.icon className="h-4 w-4" /> {ch.open}
          </button>
          <button className="btn-ghost w-full text-xs" onClick={() => { onMarkSent(lead); toast('Marcado como «En seguimiento»'); onClose(); }}>
            <Send className="h-3.5 w-3.5" /> Ya lo he enviado → marcar «En seguimiento»
          </button>
        </div>
      }
    >
      {profileIncomplete && (
        <button onClick={onOpenSettings} className="mb-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Completa tu nombre y tu web en <b>Ajustes</b> para firmar los mensajes →
        </button>
      )}

      {/* Problemas a mencionar */}
      <section>
        <h3 className="label">Puntos débiles a mencionar ({selected.length})</h3>
        <div className="flex flex-wrap gap-1.5">
          {lead.issues.map((code) => {
            const on = selected.includes(code);
            return (
              <button
                key={code}
                onClick={() => toggleIssue(code)}
                className={`badge cursor-pointer py-1 transition ${on ? TONE[ISSUES[code].tone] : 'bg-transparent text-zinc-400 ring-zinc-200 line-through dark:ring-zinc-800'}`}
              >
                {on && <Check className="h-3 w-3" />} {ISSUES[code].label}
              </button>
            );
          })}
          {lead.issues.length === 0 && <p className="text-xs text-zinc-500">Web sin problemas graves: el mensaje se centra en SEO local.</p>}
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-400">Menciona 1–2 en WhatsApp. Más de dos suena a reproche.</p>
      </section>

      {/* Canal y tono */}
      <section className="mt-5 grid gap-3">
        <div>
          <h3 className="label">Canal</h3>
          <div className="seg w-full">
            {CHANNELS.map((c) => (
              <button key={c.key} className="seg-item flex-1 justify-center" data-active={channel === c.key} onClick={() => setChannel(c.key)}>
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="label">Tono</h3>
          <div className="seg w-full">
            {TONES.map((t) => (
              <button key={t.key} className="seg-item flex-1 justify-center" data-active={tone === t.key} onClick={() => setTone(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Mensaje */}
      <section className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="label mb-0">Mensaje (editable)</h3>
          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setVariant((v) => v + 1)}>
            <RefreshCw className="h-3.5 w-3.5" /> Otra versión
          </button>
        </div>
        {channel === 'email' && (
          <input className="input mb-2 font-medium" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Asunto" />
        )}
        <textarea
          className="input min-h-[320px] resize-y font-[inherit] leading-relaxed"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-label="Cuerpo del mensaje"
        />
        <div className="mt-1.5 flex justify-between text-[11px] text-zinc-400">
          <span>{body.split(/\s+/).filter(Boolean).length} palabras</span>
          <span className={overLimit ? 'font-medium text-rose-500' : ''}>
            {body.length}{channel === 'linkedin' ? ` / ${LINKEDIN_LIMIT}` : ''} caracteres
          </span>
        </div>
        {channel === 'whatsapp' && !lead.phoneIntl && <p className="mt-2 text-xs text-rose-500">Este negocio no tiene teléfono: usa email o LinkedIn.</p>}
        {channel === 'whatsapp' && lead.phoneIntl && <p className="mt-2 text-xs text-zinc-500">Consejo: llama antes y pregunta «¿te lo mando por WhatsApp?». Convierte más y cumple la LSSI.</p>}
        {channel === 'email' && <p className="mt-2 text-xs text-zinc-500">Google Maps no da emails: búscalo en su web o redes antes de enviar. Tu cliente de correo se abrirá con el texto listo.</p>}
        {channel === 'linkedin' && <p className="mt-2 text-xs text-zinc-500">Se copia el mensaje y se abre la búsqueda de la empresa en LinkedIn para que lo pegues.</p>}
      </section>
    </Drawer>
  );
}
