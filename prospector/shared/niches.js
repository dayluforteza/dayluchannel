/**
 * Base de conocimiento comercial por nicho.
 * La usan el generador de datos, el generador de mensajes y el Asesor de Captación.
 *
 * Para añadir un nicho: copia un bloque, cambia `match` (fragmentos que detectan el nicho
 * en lo que escribes en el buscador) y adapta los textos.
 */

export const NICHES = [
  {
    key: 'electricistas',
    label: 'Electricistas',
    match: ['electric', 'instalaciones electricas', 'electro'],
    serviceNoun: 'electricista',
    searchExample: 'electricista urgente',
    compliment: 'la rapidez y el trabajo limpio',
    names: ['Electricidad {surname}', 'Instalaciones Eléctricas {place}', '{surname} Electricistas', 'Electro{word} {place}', 'Elec{word} Instalaciones', 'Electricista 24h {place}', 'Montajes Eléctricos {surname}'],
    reviews: [
      'Vinieron un domingo por un apagón y lo solucionaron en una hora. Precio justo.',
      'Muy profesionales, nos cambiaron el cuadro eléctrico entero y explicaron todo.',
      'Rápidos y limpios. Me hicieron el boletín para la compañía sin complicaciones.',
      'Llamé por la mañana y por la tarde ya estaba arreglado. Recomendable.',
      'Instalaron el punto de carga del coche eléctrico perfecto y con factura.',
    ],
    painPoints: [
      { title: 'Viven de la urgencia', detail: 'El 80 % de sus trabajos rentables entran por llamada urgente. Si en Google no aparece un botón de llamada en el primer segundo, el cliente llama al siguiente.' },
      { title: 'Dependen del boca a boca', detail: 'Facturan bien pero no controlan cuándo entra trabajo. Una web posicionada les da flujo estable entre recomendación y recomendación.' },
      { title: 'No tienen tiempo', detail: 'Están en obra todo el día. No quieren reuniones largas ni mantener nada: véndeles "te lo dejo hecho y funcionando".' },
      { title: 'Nuevos servicios con margen', detail: 'Cargadores de coche eléctrico, placas solares y domótica tienen búsquedas crecientes y mejor margen. Una página por servicio capta ese tráfico.' },
    ],
    offer: {
      title: 'Landing «Electricista urgente en {zona}»',
      detail: 'Una página rápida con botón de llamada y WhatsApp fijo, horario 24 h, zonas que cubren y reseñas de Google. Más ficha de Google Business optimizada.',
      price: '450–750 € + 29 €/mes (hosting y mantenimiento)',
      hook: 'Puedo preparar la maqueta gratis con el nombre y las reseñas del negocio, antes de cobrar nada.',
    },
    objections: [
      { q: '«Ya tengo trabajo de sobra»', a: 'Perfecto: la web no es para más trabajo, es para elegir el trabajo. Filtras urgencias caras y cargadores, y dejas lo que no compensa.' },
      { q: '«Con el boca a boca me basta»', a: 'Quien te recomienda dice tu nombre; el cliente lo busca en Google. Si no encuentra web, desconfía o llama a otro.' },
      { q: '«Es caro»', a: 'Con un solo aviso urgente al mes la web se paga. Te enseño cuánto se busca «electricista urgente» en tu zona.' },
    ],
    bestTime: 'De 8:00 a 9:00 o de 15:00 a 16:00 (antes de salir a obra o al volver de comer).',
  },
  {
    key: 'fontaneros',
    label: 'Fontaneros',
    match: ['fontaner', 'plomer', 'desatasc', 'calefacc'],
    serviceNoun: 'fontanero',
    searchExample: 'fontanero urgente',
    compliment: 'la rapidez en las urgencias',
    names: ['Fontanería {surname}', 'Fontaneros {place} 24h', 'Desatascos {word}', 'Fontanería y Calefacción {surname}', 'Agua{word} Fontaneros', 'Reparaciones {surname} Fontanería'],
    reviews: [
      'Se nos rompió una tubería de noche y en 40 minutos estaba aquí. Salvó la cocina.',
      'Precio cerrado antes de empezar y cumplió. Así da gusto.',
      'Cambiaron el termo en una mañana y se llevaron el viejo. Muy serios.',
      'Desatasco rapidísimo, muy amable y explicó qué había pasado.',
      'Les llamamos para una fuga y la encontraron sin romper medio baño.',
    ],
    painPoints: [
      { title: 'Compiten con portales y franquicias', detail: 'Las búsquedas «fontanero urgente» las copan anuncios de empresas grandes. Una landing local con reseñas reales les devuelve esas llamadas.' },
      { title: 'Clientes que comparan precio', detail: 'Sin web, el cliente solo compara por precio al teléfono. Con fotos de trabajos y reseñas, compara por confianza.' },
      { title: 'Temporadas flojas', detail: 'En verano baja la calefacción. Páginas de termos, aire acondicionado y reformas de baño rellenan esos meses.' },
      { title: 'Avisos de seguros', detail: 'Muchos viven de los seguros y cobran poco. Captar cliente directo les sube el margen por aviso.' },
    ],
    offer: {
      title: 'Landing «Fontanero urgente en {zona}» con llamada en un toque',
      detail: 'Botón de llamada y WhatsApp fijo, precios orientativos de desatasco y termo, mapa de zonas y reseñas.',
      price: '450–750 € + 29 €/mes',
      hook: 'Puedo montar la maqueta con las reseñas de Google en 48 h, sin compromiso.',
    },
    objections: [
      { q: '«Me llegan avisos del seguro»', a: 'Y cada aviso del seguro lo cobras a la mitad. La web es para que el cliente particular te llame a ti directamente.' },
      { q: '«No sé de internet»', a: 'No necesitas saber. Yo lo mantengo y tú solo coges el teléfono.' },
      { q: '«Ya tengo Facebook»', a: 'Facebook no sale cuando alguien busca «fontanero urgente» en Google. La web sí.' },
    ],
    bestTime: 'De 8:00 a 9:00 o de 15:00 a 16:00.',
  },
  {
    key: 'dentistas',
    label: 'Clínicas dentales',
    match: ['dent', 'odont', 'ortodon', 'implant'],
    serviceNoun: 'clínica dental',
    searchExample: 'dentista',
    compliment: 'el trato y la confianza',
    names: ['Clínica Dental {surname}', 'Dental {place}', 'Centro Odontológico {surname}', 'Sonrisa {word} Dental', 'Clínica Dental Dr. {surname}', 'Odontología {surname} & Asociados'],
    reviews: [
      'La doctora me explicó todo el tratamiento sin agobiarme. Por fin sin miedo al dentista.',
      'Me puse ortodoncia invisible aquí y el seguimiento ha sido impecable.',
      'Muy puntuales, instalaciones nuevas y presupuesto claro desde el primer día.',
      'Fui por una urgencia de muela y me atendieron en el día.',
      'Llevo a toda la familia. Trato cercano y precios razonables.',
    ],
    painPoints: [
      { title: 'Competencia de cadenas', detail: 'Las grandes cadenas invierten mucho en anuncios. La clínica independiente gana con confianza: equipo real, casos reales y reseñas.' },
      { title: 'Tratamientos de alto valor', detail: 'Implantes, ortodoncia invisible y estética dental tienen tickets de 1.500–6.000 €. Un solo paciente nuevo al mes paga la web de sobra.' },
      { title: 'Huecos en la agenda', detail: 'La reserva online de primera visita llena huecos sin cargar a recepción.' },
      { title: 'Normativa publicitaria sanitaria', detail: 'Necesitan una web con textos prudentes y aviso legal correcto. Ofrécete como quien lo resuelve.' },
    ],
    offer: {
      title: 'Web con reserva de primera visita y páginas por tratamiento',
      detail: 'Páginas SEO para implantes, ortodoncia invisible y blanqueamiento en {zona}, presentación del equipo, reserva online y WhatsApp.',
      price: '1.200–2.500 € + 49 €/mes',
      hook: 'Puedo hacer una auditoría gratuita con las búsquedas de «implantes en {zona}» que hoy se lleva la competencia.',
    },
    objections: [
      { q: '«Ya tenemos una agencia»', a: 'Te enseño en 10 minutos qué búsquedas estáis perdiendo. Si tu agencia ya las cubre, no te molesto más.' },
      { q: '«Lo decide el director médico»', a: 'Te dejo un resumen de una página con números para que se lo pases. ¿Cuándo le viene bien una llamada de 15 minutos?' },
      { q: '«Ahora no es el momento»', a: 'Entiendo. Septiembre y enero son los meses de más búsquedas; si empezamos ahora, llegas posicionado.' },
    ],
    bestTime: 'De 13:30 a 15:00 (pausa entre pacientes) o a primera hora con recepción.',
  },
  {
    key: 'abogados',
    label: 'Abogados',
    match: ['abogad', 'bufete', 'despacho', 'legal', 'juridic', 'asesor'],
    serviceNoun: 'abogado',
    searchExample: 'abogado de divorcios',
    compliment: 'la claridad y la cercanía',
    names: ['{surname} Abogados', 'Bufete {surname} & {surname2}', 'Despacho Jurídico {place}', '{surname} Asesores Legales', 'Abogados {place} {word}', 'Lex {word} Abogados'],
    reviews: [
      'Me llevaron el divorcio con mucha humanidad y rapidez. Muy agradecida.',
      'Explican todo sin tecnicismos. Ganamos el juicio de la herencia.',
      'Muy resolutivos con un problema laboral. Me mantuvieron informado siempre.',
      'Primera consulta clara y honorarios cerrados por escrito. Lo recomiendo.',
      'Nos ayudaron con la reclamación al banco y recuperamos todo.',
    ],
    painPoints: [
      { title: 'Clientes que buscan por problema', detail: 'Nadie busca «abogado»; buscan «cómo reclamar una herencia» o «despido improcedente». Cada especialidad necesita su página.' },
      { title: 'Confianza antes de llamar', detail: 'El cliente lee la web antes de contactar. Una web antigua transmite despacho antiguo.' },
      { title: 'Consultas que no convierten', detail: 'Pierden horas en llamadas que no encajan. Un formulario de consulta previa filtra casos.' },
      { title: 'Ticket alto', detail: 'Un caso medio factura 1.500–5.000 €. Con un caso al trimestre la web se amortiza.' },
    ],
    offer: {
      title: 'Web por especialidad + formulario de consulta previa',
      detail: 'Una página por área (familia, laboral, herencias…) optimizada para {zona}, formulario que filtra casos y 4 artículos de preguntas frecuentes.',
      price: '900–1.800 € + 39 €/mes',
      hook: 'Puedo enviar las 10 preguntas que más se buscan sobre la especialidad en {zona} y cuáles no están cubiertas.',
    },
    objections: [
      { q: '«Nuestros clientes vienen por recomendación»', a: 'Y lo primero que hacen es buscaros en Google. La web confirma o tumba esa recomendación.' },
      { q: '«No podemos hacer publicidad agresiva»', a: 'No hace falta: contenido útil y bien posicionado, dentro del código deontológico.' },
      { q: '«Lo pensaré»', a: 'Claro. ¿Te parece que te llame el jueves y lo cerramos en 10 minutos, sea sí o no?' },
    ],
    bestTime: 'De 9:30 a 11:00 (antes de juicios y reuniones).',
  },
  {
    key: 'restaurantes',
    label: 'Restaurantes y bares',
    match: ['restaur', 'bar ', 'bares', 'cafeter', 'pizz', 'taberna', 'tapas', 'marisquer', 'asador'],
    serviceNoun: 'restaurante',
    searchExample: 'restaurante para cenar',
    compliment: 'la comida y el servicio',
    names: ['Restaurante {surname}', 'Taberna {word}', 'Casa {surname}', 'Bar {place}', 'Asador {surname}', 'La Cocina de {first}', 'El Rincón de {first}'],
    reviews: [
      'El pescado fresquísimo y el trato de diez. Volveremos seguro.',
      'Menú del día muy completo por un precio muy razonable.',
      'Las croquetas son las mejores que he probado en la zona.',
      'Reservamos para un cumpleaños y lo hicieron todo facilísimo.',
      'Ambiente familiar, raciones generosas y camareros muy atentos.',
    ],
    painPoints: [
      { title: 'Comisiones de plataformas', detail: 'Pagan comisión por cada reserva o pedido en plataformas. Una web propia con reservas les ahorra ese porcentaje.' },
      { title: 'Carta desactualizada en internet', detail: 'Turistas y clientes nuevos buscan la carta antes de ir. PDF borroso o foto antigua = pierden mesa.' },
      { title: 'Turismo', detail: 'En zonas turísticas una web en inglés con carta traducida capta mesas que hoy se van al vecino.' },
      { title: 'Poco tiempo y poco presupuesto', detail: 'Oferta sencilla, cerrada y rápida. Nada de proyectos largos.' },
    ],
    offer: {
      title: 'Web con carta digital, QR y reservas',
      detail: 'Carta editable en español e inglés, QR para mesa, botón de reserva y enlace a la ficha de Google con fotos.',
      price: '390–700 € + 25 €/mes',
      hook: 'Puedo pasar la carta actual a formato web y QR gratis, como prueba.',
    },
    objections: [
      { q: '«Ya estoy en TheFork / Google»', a: 'Bien, y pagas por cada reserva. La web propia es el canal donde no pagas comisión.' },
      { q: '«Estoy hasta arriba de trabajo»', a: 'Solo necesito tu carta y 4 fotos. Del resto me encargo yo.' },
      { q: '«No tengo presupuesto»', a: 'Empezamos con la carta QR y reservas, que se paga sola con las comisiones que te ahorras.' },
    ],
    bestTime: 'De 16:00 a 18:00 (entre servicios). Nunca a mediodía ni de noche.',
  },
  {
    key: 'belleza',
    label: 'Peluquerías y estética',
    match: ['pelu', 'barber', 'estetic', 'salon', 'uñas', 'unas', 'spa', 'masaj', 'belleza'],
    serviceNoun: 'peluquería',
    searchExample: 'peluquería',
    compliment: 'el trato y los resultados',
    names: ['Peluquería {first}', '{first} Estilistas', 'Barbería {word}', 'Salón {first} Beauty', 'Centro de Estética {first}', 'Studio {word} Hair'],
    reviews: [
      'Salí encantada con el color, me asesoraron súper bien.',
      'La mejor barbería de la zona. Puntuales y muy buen ambiente.',
      'Me hice las uñas y duraron perfectas tres semanas.',
      'Trato muy cariñoso y resultados de revista.',
      'Por fin alguien que entiende lo que le pides con el corte.',
    ],
    painPoints: [
      { title: 'Citas por teléfono e Instagram', detail: 'Pierden tiempo contestando mensajes para cuadrar citas. La reserva online 24/7 libera horas cada semana.' },
      { title: 'Ausencias', detail: 'Los recordatorios automáticos de cita reducen los «no shows».' },
      { title: 'Instagram no posiciona', detail: 'Tienen trabajos preciosos en Instagram, pero Google no los enseña cuando buscan «peluquería en {zona}».' },
      { title: 'Servicios premium', detail: 'Mechas, tratamientos y novias tienen mejor margen. Una galería por servicio los vende.' },
    ],
    offer: {
      title: 'Web con reserva de cita online y galería de trabajos',
      detail: 'Reserva 24/7 con recordatorios, precios por servicio, galería conectada a Instagram y botón de WhatsApp.',
      price: '400–750 € + 25 €/mes',
      hook: 'Puedo preparar la maqueta con las fotos de Instagram para verla antes de decidir nada.',
    },
    objections: [
      { q: '«Ya uso una app de citas»', a: 'Perfecto, la integramos. La web es para que te encuentren; la app es para gestionar.' },
      { q: '«Con Instagram tengo suficiente»', a: 'Instagram es para quien ya te sigue. Google es para quien aún no te conoce.' },
      { q: '«Me lo pienso»', a: 'Te dejo la maqueta hecha con tus fotos. Si no te gusta, no pasa nada.' },
    ],
    bestTime: 'De 10:00 a 11:30 entre semana (primeras horas más tranquilas). Evita sábados.',
  },
  {
    key: 'fisioterapia',
    label: 'Fisioterapia y salud',
    match: ['fisio', 'osteo', 'quiro', 'podolog', 'psicolog', 'nutricion'],
    serviceNoun: 'centro de fisioterapia',
    searchExample: 'fisioterapeuta',
    compliment: 'el trato y la recuperación',
    names: ['Fisioterapia {surname}', 'Centro de Fisio {place}', 'Fisio{word}', 'Clínica {word} Salud', 'Fisioterapia y Osteopatía {first}'],
    reviews: [
      'Llegué con una lumbalgia horrible y en tres sesiones estaba como nueva.',
      'Muy profesionales, te explican los ejercicios para casa.',
      'Me recuperaron de una lesión de rodilla antes de lo previsto.',
      'Ambiente tranquilo y trato cercano. Muy recomendable.',
      'Fui por contractura y repetiré seguro.',
    ],
    painPoints: [
      { title: 'Pacientes por dolencia', detail: 'Buscan «fisio para lumbalgia» o «fisio deportivo». Páginas por dolencia captan ese tráfico.' },
      { title: 'Bonos y recurrencia', detail: 'Vender bonos online sube el ticket medio y asegura recurrencia.' },
      { title: 'Agenda manual', detail: 'Reserva online y recordatorios bajan las ausencias.' },
    ],
    offer: {
      title: 'Web con reserva online y páginas por dolencia',
      detail: 'Páginas para lumbalgia, cervicales y lesiones deportivas en {zona}, reserva y venta de bonos.',
      price: '600–1.100 € + 35 €/mes',
      hook: 'Puedo enseñar cuántas personas buscan «fisioterapeuta en {zona}» al mes y en qué posición sale el centro.',
    },
    objections: [
      { q: '«Tengo la agenda llena»', a: 'Entonces la web sirve para subir precio y llenar solo con los tratamientos que más te compensan.' },
      { q: '«Ya tengo Doctoralia»', a: 'Doctoralia te cobra y te pone junto a tu competencia. Tu web es solo tuya.' },
      { q: '«Es mucho dinero»', a: 'Un bono de 5 sesiones al mes ya la paga.' },
    ],
    bestTime: 'De 13:30 a 15:30 (pausa de mediodía).',
  },
  {
    key: 'talleres',
    label: 'Talleres mecánicos',
    match: ['taller', 'mecanic', 'chapa', 'neumat', 'automo', 'coche'],
    serviceNoun: 'taller',
    searchExample: 'taller mecánico',
    compliment: 'la honestidad con los presupuestos',
    names: ['Talleres {surname}', 'Auto {word} {place}', 'Taller Mecánico {surname}', 'Neumáticos {word}', 'Chapa y Pintura {surname}', 'Garaje {surname}'],
    reviews: [
      'Honestos: me dijeron que no hacía falta cambiar la pieza que otro taller quería cambiar.',
      'Pasé la ITV a la primera después de la revisión. Muy buen precio.',
      'Rápidos con el cambio de neumáticos y sin cita previa.',
      'Me dejaron el coche como nuevo tras el golpe. Gestionaron el seguro.',
      'Presupuesto claro y cumplieron plazo. Repetiré.',
    ],
    painPoints: [
      { title: 'Desconfianza en el sector', detail: 'El cliente teme que le engañen. Web con precios orientativos y reseñas les diferencia.' },
      { title: 'Pre-ITV y temporadas', detail: 'Campañas de pre-ITV, aire acondicionado en verano y neumáticos en invierno llenan el taller.' },
      { title: 'Teléfono saturado', detail: 'Un formulario de cita y presupuesto ahorra llamadas.' },
    ],
    offer: {
      title: 'Web con pedir cita y presupuesto online',
      detail: 'Servicios con precio orientativo, cita online, campaña pre-ITV y botón de WhatsApp.',
      price: '450–850 € + 29 €/mes',
      hook: 'Puedo preparar gratis la página de «revisión pre-ITV en {zona}» para ver cómo quedaría.',
    },
    objections: [
      { q: '«Mis clientes son de toda la vida»', a: 'Y cada año alguno se jubila o cambia de coche. La web trae los nuevos.' },
      { q: '«No tengo tiempo para eso»', a: 'Me das una hora una vez. Del resto me encargo yo.' },
      { q: '«Ya me conocen en el barrio»', a: 'Los vecinos nuevos buscan en Google, no preguntan en el bar.' },
    ],
    bestTime: 'De 9:00 a 10:00 o de 16:00 a 17:00.',
  },
  {
    key: 'reformas',
    label: 'Reformas y construcción',
    match: ['reform', 'albañil', 'albanil', 'construc', 'pintor', 'carpinter', 'cocinas', 'baños', 'banos'],
    serviceNoun: 'empresa de reformas',
    searchExample: 'reforma de baño',
    compliment: 'los acabados y el cumplimiento de plazos',
    names: ['Reformas {surname}', 'Construcciones {surname} e Hijos', 'Reformas Integrales {place}', '{word} Reformas', 'Pinturas {surname}', 'Obras y Reformas {surname}'],
    reviews: [
      'Nos reformaron la cocina en el plazo que dijeron. Acabados perfectos.',
      'Presupuesto detallado y sin sorpresas al final. Muy serios.',
      'Reforma integral del piso y quedó espectacular. Gestionaron hasta la licencia.',
      'Limpiaban cada día al terminar. Un gusto trabajar con ellos.',
      'El baño quedó mejor de lo que imaginábamos.',
    ],
    painPoints: [
      { title: 'Ticket muy alto', detail: 'Una reforma de baño o cocina factura 5.000–25.000 €. Un cliente nuevo al año paga la web diez veces.' },
      { title: 'El cliente quiere ver obras', detail: 'Sin galería de antes/después no transmiten nivel. Es lo primero que miran.' },
      { title: 'Presupuestos que no cierran', detail: 'Pierden tardes visitando clientes que no encajan. Un formulario con metros y presupuesto orientativo filtra.' },
    ],
    offer: {
      title: 'Web con galería de antes/después y calculadora de presupuesto',
      detail: 'Portfolio por tipo de reforma, calculadora orientativa por m² y formulario que filtra solicitudes.',
      price: '900–1.600 € + 39 €/mes',
      hook: 'Puedo montar gratis la galería de antes/después con fotos de móvil para ver el impacto.',
    },
    objections: [
      { q: '«Tengo obras para meses»', a: 'Genial: usa la web para subir precios y elegir obras más grandes.' },
      { q: '«No tengo fotos buenas»', a: 'Con las del móvil basta. Yo las trato y monto el antes/después.' },
      { q: '«Ya probé con una web y no funcionó»', a: '¿Estaba posicionada para «reformas en tu zona»? Te enseño en 5 minutos dónde fallaba.' },
    ],
    bestTime: 'De 8:00 a 9:00 o a partir de las 18:00.',
  },
];

/** Nicho genérico cuando lo que escribes no encaja con ninguno conocido. */
export function genericNiche(raw = 'negocios locales') {
  const label = capitalize(raw.trim() || 'Negocios locales');
  const noun = raw.trim().toLowerCase().replace(/s$/, '') || 'negocio';
  return {
    key: 'generic',
    label,
    match: [],
    serviceNoun: noun,
    searchExample: noun,
    compliment: 'el trato y la profesionalidad',
    names: [`{surname} ${label}`, `${label} {place}`, `{word} ${label}`, `${label} {surname} e Hijos`, `Grupo {word}`],
    reviews: [
      'Trato excelente y muy profesionales. Repetiré.',
      'Rápidos, serios y con buen precio. Muy recomendables.',
      'Resolvieron justo lo que necesitaba sin complicaciones.',
      'Atención cercana y resultados por encima de lo esperado.',
    ],
    painPoints: [
      { title: 'Invisibles en Google', detail: `Quien busca «${noun} en su zona» no les encuentra fuera de Maps. La competencia con web se lleva el clic.` },
      { title: 'Confianza', detail: 'Una web actual con reseñas y fotos reales convierte visitas en llamadas.' },
      { title: 'Tiempo', detail: 'No quieren gestionar nada técnico. Véndeles un servicio llave en mano.' },
    ],
    offer: {
      title: `Web local optimizada «${noun} en {zona}»`,
      detail: 'Web rápida, adaptada a móvil, con botón de llamada y WhatsApp, reseñas y ficha de Google optimizada.',
      price: '450–900 € + 29 €/mes',
      hook: 'Puedo preparar la maqueta gratis con el nombre y las reseñas del negocio.',
    },
    objections: [
      { q: '«No lo necesito»', a: 'Te enseño cuánta gente busca tu servicio en tu zona cada mes y a quién llama.' },
      { q: '«Es caro»', a: 'Con un cliente nuevo al mes se paga. Te enseño los números.' },
      { q: '«Ahora no»', a: '¿Te parece que lo retomemos en dos semanas? Te dejo la maqueta hecha.' },
    ],
    bestTime: 'Media mañana (10:00–12:00) entre semana.',
  };
}

/** Busca el nicho que mejor encaja con el texto escrito en el buscador. */
export function resolveNiche(input = '') {
  const t = ` ${normalize(input)} `;
  return NICHES.find((n) => n.match.some((m) => t.includes(normalize(m)))) ?? genericNiche(input);
}

/**
 * Secuencia de seguimiento. Sirve para todos los nichos.
 * `day` cuenta desde el primer mensaje.
 */
export const FOLLOW_UP = [
  { day: 0, channel: 'Llamada o WhatsApp', action: 'Primer contacto personalizado con 1–2 problemas concretos de su web.' },
  { day: 3, channel: 'WhatsApp / Email', action: 'Seguimiento corto con valor: captura de la maqueta o de su web en móvil vs. la competencia.' },
  { day: 7, channel: 'Llamada', action: 'Llamada de 2 minutos: «¿Pudiste ver lo que te mandé?». Propón 15 min para enseñarlo.' },
  { day: 14, channel: 'Email', action: 'Mensaje de cierre: «No quiero molestarte; si no es el momento, lo dejo aquí». Suele tener la tasa de respuesta más alta.' },
  { day: 45, channel: 'WhatsApp', action: 'Reactivar con un caso real de un cliente del mismo sector.' },
];

export const COUNTRIES = [
  { code: 'ES', name: 'España', flag: '🇪🇸', dial: '34', tld: '.es', ustedes: false },
  { code: 'MX', name: 'México', flag: '🇲🇽', dial: '52', tld: '.com.mx', ustedes: true },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', dial: '1', tld: '.com', ustedes: true },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dial: '54', tld: '.com.ar', ustedes: true },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dial: '57', tld: '.com.co', ustedes: true },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dial: '56', tld: '.cl', ustedes: true },
];

export function normalize(s = '') {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function capitalize(s = '') {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
