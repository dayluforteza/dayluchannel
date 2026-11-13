# Prospector · Captación de clientes web y SEO

App privada para encontrar negocios locales con web mala o sin web, escribirles un mensaje personalizado y llevar el seguimiento.

## Arrancar

```bash
cd prospector
npm install
npm run dev          # frontend (5173) + API (8787)
```

Abre http://localhost:5173

Producción (un solo proceso que sirve API + web): `npm start` → http://localhost:8787

## Datos reales o simulados

| Modo | Qué hace |
|---|---|
| Sin `.env` | Datos simulados realistas. Misma búsqueda = mismos negocios. |
| `GOOGLE_PLACES_API_KEY` | Negocios reales de Google Places (hasta 20 por búsqueda) + auditoría real de cada web. |
| `PAGESPEED_API_KEY` | Además mide la velocidad móvil real (añade ~10 s por web). |

```bash
cp .env.example .env   # y pega tu clave
```

Coste orientativo de Google Places Text Search: consulta la tabla de precios de Google Maps Platform; incluye un crédito mensual gratuito.

## Qué audita de cada web (real)

- HTTPS (si acaba en `https://` tras redirecciones)
- Adaptada a móvil (`<meta name="viewport">`)
- SEO básico (`<title>` ≥ 10 caracteres + meta description)
- Antigüedad (año del © más reciente)
- Botón de llamada / WhatsApp (`tel:` o `wa.me`)
- Web caída o inaccesible
- Velocidad móvil (solo con `PAGESPEED_API_KEY`)

La caducidad del dominio solo aparece en modo simulado (requiere WHOIS).

## Estructura

```
prospector/
├── shared/              # Lógica común a backend y frontend
│   ├── niches.js        # Base de conocimiento por nicho (argumentos, ofertas, objeciones, horarios)
│   ├── audit.js         # Estado web + problemas + puntuación de oportunidad
│   └── generator.js     # Generador de datos simulados (determinista)
├── server/
│   ├── index.js         # API Node sin dependencias + sirve /dist
│   └── providers/
│       ├── googlePlaces.js
│       └── webAudit.js
└── src/
    ├── App.jsx
    ├── components/      # SearchPanel, ProspectCard, OutreachDrawer, AdvisorPanel, PipelineView…
    ├── hooks/           # useLeads (CRM en localStorage), useTheme, useLocalState
    ├── lib/             # outreach.js (generador de mensajes), status.js, csv.js
    └── services/api.js  # Llama a /api; si no hay backend, genera datos en el navegador
```

## Añadir un nicho

Copia un bloque en `shared/niches.js`, cambia `match` (fragmentos que lo detectan) y adapta textos. Se usa automáticamente en mensajes y en el Asesor.

## Legal (España)

La LSSI (art. 21) prohíbe enviar publicidad por email o mensajería sin consentimiento previo, también a empresas. Flujo recomendado: llamar o visitar → preguntar «¿te lo mando por WhatsApp?» → enviar el mensaje generado.
