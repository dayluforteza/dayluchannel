/** Acceso seguro a localStorage (puede fallar en modo privado o con almacenamiento bloqueado). */
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento disponible: la app sigue funcionando en memoria */
  }
}
