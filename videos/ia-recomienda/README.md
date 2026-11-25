# Vídeo: «La IA ya recomienda negocios. ¿Recomienda el tuyo?»

Vertical 1080×1920, 30 fps, ~44 s. Escenas en 3D reales (Remotion + three.js), voz en off y subtítulos palabra a palabra.

## Cómo se hace otro
1. Edita `guion.json` (escenas y textos).
2. `python3 tts.py` → genera la voz (`public/*.mp3`) y los tiempos de cada palabra (`src/timing.json`).
3. `npm install` (solo la primera vez).
4. `npm run render` → `out/video.mp4`.

Escenas 3D en `src/Scene3D.tsx` (móvil con chat de IA, tarjetas de resultados, pin de mapa, estrellas y reseña, navegador web, «IA» en 3D). Textos y subtítulos en `src/Video.tsx`.
Render con WebGL por software (`--gl=swangle`) porque el servidor no tiene GPU.

## Texto para publicar (Instagram / TikTok / Shorts)
Tus clientes ya no solo buscan en Google: le preguntan a la IA. Y la IA contesta con 2 o 3 nombres.
3 cosas para que el tuyo esté entre ellos:
1️⃣ Ficha de Google completa: horario, fotos y servicios.
2️⃣ Reseñas que cuenten qué hiciste, no solo estrellas.
3️⃣ Web propia y rápida que diga qué haces, dónde y cuánto cuesta.
Comenta «IA» y te reviso si tu negocio aparece.

#inteligenciaartificial #negocioslocales #marketingdigital #paginaweb #google #chatgpt #claude #emprendedores #malaga #autonomos
