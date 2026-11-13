/**
 * Cliente de la API. Intenta el backend (/api/search); si no está disponible,
 * genera los datos en el navegador para que la app funcione siempre.
 */
import { generateProspects } from '../../shared/generator.js';

export async function searchProspects(query) {
  const params = new URLSearchParams(query);
  try {
    const res = await fetch(`/api/search?${params}`, { signal: AbortSignal.timeout(120_000) });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.results) return data;
    // 4xx/5xx con mensaje del backend (p. ej. clave de Google inválida): lo mostramos.
    if (data?.error && res.status !== 404) throw Object.assign(new Error(data.error), { fatal: true });
    throw new Error('Backend no disponible');
  } catch (err) {
    if (err.fatal) throw err;
    await new Promise((r) => setTimeout(r, 900));
    return { source: 'mock-local', query, results: generateProspects(query) };
  }
}
