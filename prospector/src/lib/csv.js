import { ISSUES, WEB_STATUS } from '../../shared/audit.js';
import { statusByKey } from './status';

/** Descarga los prospectos visibles como CSV (separador «;» para Excel en español). */
export function exportCsv(rows, leads) {
  const head = ['Nombre', 'Teléfono', 'Dirección', 'Valoración', 'Reseñas', 'Web', 'Estado web', 'Problemas', 'Oportunidad', 'Estado CRM', 'Notas'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    r.name, r.phone, r.address, String(r.rating).replace('.', ','), r.reviewCount, r.website ?? '',
    WEB_STATUS[r.status].label, r.issues.map((i) => ISSUES[i].label).join(' | '), r.score,
    statusByKey[leads[r.id]?.status ?? 'todo'].label, leads[r.id]?.note ?? '',
  ].map(esc).join(';'));
  const blob = new Blob(['﻿' + [head.map(esc).join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `prospectos-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(a.href);
}
