# Prospector

App: https://claude.ai/artifact/LRd6Bx49XXfSEDXSuDrahw

- `fetch_osm.py`: descarga negocios de la provincia de Málaga (OpenStreetMap) por nicho y los puntúa.
- `enrich.py`: asigna municipio, penaliza cadenas y corrige webs mal etiquetadas.
- `actualizar.sh`: repite todo y dice cuántos negocios nuevos hay.
- `index.html` + `leads.json`: la app publicada. El seguimiento (estado, cita, notas) se guarda en la base de datos del artefacto (`seguimiento`, `eventos`).
