# Agente: Prospector (v1 en marcha)

## Tarea
Encontrar negocios locales que necesiten una web informativa y reunirlos en una sola app con búsqueda automática y manual. Para cada negocio, preparar un argumento de venta.

## Zona y escala
Málaga capital y provincia → Andalucía → España. Objetivo: 30.000 negocios.

## Oferta (fuente: web "Daylu Forteza Web", páginas Precios y Desarrollo web)
- Web: más de 650 € + IVA (650 € es el suelo, no el precio estándar; landing o corporativa compacta). Más grande: presupuesto cerrado (objetivo 1.000-2.000 €).
- Pago: 50 % al empezar, 50 % al entregar.
- Mantenimiento: 45 € + IVA/mes. Incluye alojamiento, dominio, correo, copias y actualizaciones. Sin horas incluidas. Sin permanencia (aviso 1 mes).
- Mes 1: precio de la web + 45 € + IVA del primer mes (mínimo 695 € + IVA). Desde el mes 2: 45 € + IVA.
- Cambios: horas a 20 € + IVA, bolsa de 20 h a 340 € + IVA (lanzamiento, 10 primeros clientes).
- Garantía: 3 meses.
- Propiedad: dominio, alojamiento, código y contenido a nombre del cliente ("cuatro llaves").
- Diferencial: código a mano, sin constructor de alquiler.

## Portfolio disponible
- Elsparky — electricista en Fuengirola (artefacto). Sirve de ejemplo para el nicho de oficios.
- Fichas "Propuesta" en la web (landing de captación, web de estudio profesional, fisioterapia).

## Datos por negocio
Nombre, sector, dirección, teléfono, email, web (sí/no), nota y número de reseñas en Google, Instagram/Facebook, horario.

## Prioridad de compra (de más a menos)
1. Sin web
2. Web antigua o rota
3. Muchas reseñas
4. Solo Instagram/Facebook
5. Sector concreto

## Argumento por negocio (señal → frase de la web)
- Sin web → "Tu negocio, explicado en una web."
- Web rota en móvil → "Un diseño que se rompe en el móvil, que es de donde llegan la mayoría de las visitas."
- Web lenta → "Una carga lenta que hace que la gente se vaya antes de leer."
- Formulario roto → "Formularios que no le llegan a nadie."
- Web antigua → "Una web antigua que no transmite la calidad de tu trabajo."
- Siempre: precio de entrada 695 € el primer mes, todo a su nombre.

## Nichos (Málaga)
- Entrada (650-800 €): reformas y oficios, talleres, peluquerías/barberías/estética, fisioterapia.
- Superior (+1.000 €): clínicas dentales y veterinarias, inmobiliarias, gestorías/abogados con clientela extranjera.
- Descartado al inicio: restaurantes.

## Guion de llamada (lo genera el agente por negocio)
1. Pedir por el encargado.
2. Gancho con un dato real del negocio (reseñas, nota, sin web, web rota).
3. Pedir solo 15 minutos para enseñarle una web de su sector.
4. Proponer dos huecos concretos de cita.
5. Si dice no: preguntar si puede volver a llamar en 3 meses o marcar "No llamar".

## Webs de ejemplo por nicho (portfolio de demostración)
- Oficios: Elsparky (hecha).
- Pendientes: taller mecánico, peluquería/barbería, fisioterapia. Marcar como "ejemplo", no como cliente real.

## App: estados de cada negocio
Nuevo → Llamado (sin respuesta / no está el encargado) → Cita concertada (fecha y hora) → Presupuesto enviado → Vendido / Descartado / No llamar.

## Habilidad (skill)
La oferta y los argumentos se guardan como skill reutilizable: el agente la usa para cada ficha de negocio.

## Conexiones (fase 4)
- Fuentes: OpenStreetMap (barrido gratis de toda la zona) + Google Places (completa teléfono, web, nota y reseñas solo de los mejores candidatos).
- Destino: artefacto nuevo e independiente (no PlexusCRM).
- Primer contacto: LLAMADA. Preguntar por el encargado y cerrar una cita para enseñarle webs de ejemplo de su sector.
- Cumplimiento (LGTel art. 66): priorizar sociedades (S.L., S.A.); botón "No volver a llamar"; registro de cada llamada; ofrecer baja en la propia llamada. Consultar Lista Robinson antes de campañas grandes. Confirmar con asesor.
- Datos: solo datos públicos de negocios. RGPD: interés legítimo B2B, opción de baja y borrado.

## Automatización (fase 5)
- Disparador: búsqueda automática semanal, lunes 07:00 (Europe/Madrid). Un sector + una zona nuevos cada semana. Además, botón "Buscar" manual.
- Recargar la app = leer lo guardado. No consulta Google en cada recarga.
- El agente solo: busca, puntúa, escribe argumento y guion de llamada.
- Emails automáticos SOLO a quien ya habló contigo por teléfono (LSSI art. 21 prohíbe email comercial no solicitado):
  1. Confirmación de cita con webs de ejemplo de su sector (tras marcar "Cita concertada").
  2. Recordatorio 24 h antes.
  3. Seguimiento 3 días después de enviar presupuesto.
- Monitor de respuestas: lee la bandeja, asocia la respuesta al negocio, resume en 2 líneas, actualiza estado y cita en la app, y guarda el email enviado y la respuesta.
- Tú: llamas y apuntas el resultado.
- Marcador semanal: llamadas, citas, presupuestos, webs vendidas.

## Pendiente
Fase 2: emails desde IONOS (info@dayluforteza.es), monitor de respuestas, Google Places con presupuesto 0-20 €/mes, webs de ejemplo por nicho.

## Construcción (fase 6)
- App: https://claude.ai/artifact/LRd6Bx49XXfSEDXSuDrahw (código en prospector/). Une esta versión con la app React de la rama ccr-82321a2b-vga4bg: auditoría web, Asesor por nicho, mensajes, Pipeline y CSV.
- Actualización: mañana 17/11 a las 07:00 y cada lunes a las 07:00 (Europe/Madrid).
- Presupuesto: 0-20 €/mes. Correo: IONOS.

## Integración con PlexusCRM y Finanzas
- Tarea "Prospector → PlexusCRM y Finanzas": cada hora, minuto 20. Reglas en `prospector/sync-plexus.md`.
- Cita concertada → cliente en el CRM (Contactado) + reunión en el calendario.
- Presupuesto enviado → Propuesta enviada.
- Vendido → Activo, tareas del proyecto y 3 facturas en borrador (anticipo 50 %, pago final 50 %, primer mes de mantenimiento 45 €).
- Finanzas cuenta el ingreso cuando la factura se marca como cobrada en el CRM.
- De vuelta: si el cliente se gana o se pierde en el CRM, Prospector se actualiza. Resumen en el marcador de Prospector.
- Nunca emite, cobra ni borra facturas.
