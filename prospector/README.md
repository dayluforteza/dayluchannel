# Prospector

App: https://claude.ai/artifact/LRd6Bx49XXfSEDXSuDrahw

Une las dos versiones:
- Esta (rama ccr-57224d92-wej8q0): datos reales de OpenStreetMap, seguimiento guardado en la base de datos del artefacto, actualización programada, guion de llamada.
- La anterior (rama ccr-82321a2b-vga4bg, app React + Node): auditoría web, Asesor por nicho (`niches.json`, exportado de `shared/niches.js` con los precios de Daylu), generador de mensajes, Pipeline con aviso a 3 días, CSV.

Archivos:
- `fetch_osm.py`: descarga negocios de la provincia de Málaga por nicho.
- `enrich.py`: municipio, cadenas y webs mal etiquetadas.
- `audit.py`: revisa cada web (caída, móvil, HTTPS, SEO, año, botón de llamada) y calcula la puntuación de oportunidad.
- `actualizar.sh`: repite todo y dice cuántos negocios nuevos hay.
- `index.html` + `leads.json` + `niches.json`: la app publicada. Seguimiento en las colecciones `seguimiento` y `eventos`.
