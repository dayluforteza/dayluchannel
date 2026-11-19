# Prospector

App: https://claude.ai/artifact/LRd6Bx49XXfSEDXSuDrahw

Toda España (52 provincias) y Portugal (20 distritos). Solo se guardan los negocios con puntuación >= 70 y teléfono (los de mayor probabilidad de compra).

- `process_pbf.py`: procesa en local los extractos de OpenStreetMap (descargados de openstreetmap.fr), asigna provincia por polígono y municipio por núcleo cercano, audita webs, puntúa y escribe `leads/<ISO>.json` + `provincias.json`.
- `fetch_all.py`: misma lógica vía Overpass (de reserva; los servidores públicos fallan a menudo). Define nichos, cadenas y exclusiones (notarías).
- `audit.py`: auditoría de webs y puntuación.
- `actualizar.sh`: descarga, procesa y compara con la versión anterior.
- `index.html` + `niches.json`: la app. Seguimiento en `seguimiento` (cada documento guarda una copia del negocio en `lead`, para que los comentados no desaparezcan aunque salgan de la selección) y `eventos`.
- `fetch_osm.py`, `enrich.py`, `leads.json`: versión antigua solo de Málaga (se conservan como referencia).
