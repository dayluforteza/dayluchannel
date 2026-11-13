import { UserCog } from 'lucide-react';
import Drawer from './Drawer';

const FIELDS = [
  { key: 'name', label: 'Tu nombre', placeholder: 'Daylu Forteza' },
  { key: 'role', label: 'A qué te dedicas (aparece en el saludo)', placeholder: 'desarrollador web freelance' },
  { key: 'city', label: 'Tu ciudad', placeholder: 'Málaga' },
  { key: 'brand', label: 'Marca', placeholder: 'Daylu' },
  { key: 'web', label: 'Tu web', placeholder: 'daylu.es' },
  { key: 'phone', label: 'Tu teléfono', placeholder: '600 000 000' },
];

/** Perfil del remitente: se usa para firmar los mensajes. */
export default function SettingsModal({ open, onClose, settings, setSettings }) {
  return (
    <Drawer open={open} onClose={onClose} icon={UserCog} title="Ajustes" subtitle="Tus datos para firmar los mensajes" width="max-w-md">
      <div className="space-y-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="label">{f.label}</span>
            <input className="input" placeholder={f.placeholder} value={settings[f.key] ?? ''} onChange={(e) => setSettings((s) => ({ ...s, [f.key]: e.target.value }))} />
          </label>
        ))}
        <p className="text-xs text-zinc-500">Se guarda solo en este navegador.</p>
      </div>
    </Drawer>
  );
}
