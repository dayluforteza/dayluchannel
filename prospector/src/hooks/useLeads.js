import { useCallback } from 'react';
import { useLocalState } from './useLocalState';

/**
 * CRM interno. Guarda por ID de prospecto:
 *   { status, updatedAt, note, history: [{status, at}], lead: {...snapshot} }
 * El snapshot permite ver el pipeline aunque cambies de búsqueda.
 */
export function useLeads() {
  const [leads, setLeads] = useLocalState('prospector.leads.v1', {});

  const setStatus = useCallback((lead, status) => {
    setLeads((prev) => {
      const now = Date.now();
      const cur = prev[lead.id];
      if (status === 'todo' && !cur?.note) {
        // Volver a «Por contactar» sin notas = quitar del pipeline.
        const { [lead.id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [lead.id]: {
          note: cur?.note ?? '',
          ...cur,
          status,
          updatedAt: now,
          history: [...(cur?.history ?? []), { status, at: now }].slice(-20),
          lead,
        },
      };
    });
  }, [setLeads]);

  const setNote = useCallback((lead, note) => {
    setLeads((prev) => ({
      ...prev,
      [lead.id]: { status: 'todo', updatedAt: Date.now(), history: [], ...prev[lead.id], note, lead },
    }));
  }, [setLeads]);

  const reset = useCallback(() => setLeads({}), [setLeads]);

  return { leads, setStatus, setNote, reset };
}
