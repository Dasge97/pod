/* POD — Datos mock. Equipo de desarrollo, contenido realista en español. */
(function () {
  const users = [
    { id: "u1", nombre: "Marta Ruiz",      ini: "MR", rol: "Responsable de departamento", color: "bg-emerald-500", proyectos: 5, tareas: 4,  carga: 72 },
    { id: "u2", nombre: "Javier Alonso",   ini: "JA", rol: "Responsable de proyecto",      color: "bg-blue-500",    proyectos: 3, tareas: 7,  carga: 88 },
    { id: "u3", nombre: "Lucía Fernández", ini: "LF", rol: "Desarrolladora",               color: "bg-violet-500",  proyectos: 2, tareas: 9,  carga: 94 },
    { id: "u4", nombre: "Diego Navarro",   ini: "DN", rol: "Desarrollador",                color: "bg-amber-500",   proyectos: 2, tareas: 5,  carga: 61 },
    { id: "u5", nombre: "Sara Molina",     ini: "SM", rol: "Desarrolladora",               color: "bg-rose-500",    proyectos: 3, tareas: 6,  carga: 78 },
    { id: "u6", nombre: "Pablo Herrera",   ini: "PH", rol: "Responsable de proyecto",      color: "bg-cyan-500",    proyectos: 2, tareas: 3,  carga: 44 },
    { id: "u7", nombre: "Elena Vidal",     ini: "EV", rol: "Responsable comercial",        color: "bg-indigo-500",  proyectos: 0, tareas: 2,  carga: 38 },
    { id: "u8", nombre: "Carlos Ortega",   ini: "CO", rol: "Desarrollador",                color: "bg-teal-500",    proyectos: 2, tareas: 8,  carga: 83 },
    { id: "u9", nombre: "Nuria Castro",    ini: "NC", rol: "Responsable comercial",        color: "bg-fuchsia-500", proyectos: 0, tareas: 1,  carga: 29 },
  ];

  // estado proyecto: pendiente | progreso | bloqueado | revision | finalizado
  // prioridad: baja | media | alta | critica
  const proyectos = [
    { id: "p1", nombre: "Portal Cliente B2B", cliente: "Distribuciones Vega", estado: "bloqueado", prioridad: "critica",
      progreso: 58, responsable: "u1", inicio: "12 feb", finEst: "30 jun", finReal: null, tareasPend: 7, tareasTot: 24, sinActividad: 0, descripcion: "Portal de autoservicio para clientes mayoristas: catálogo, pedidos recurrentes y seguimiento de envíos.", retrasado: false },
    { id: "p2", nombre: "Migración a microservicios", cliente: "Interno", estado: "progreso", prioridad: "alta",
      progreso: 41, responsable: "u2", inicio: "03 mar", finEst: "15 sep", finReal: null, tareasPend: 12, tareasTot: 31, sinActividad: 1, descripcion: "Descomposición del monolito de facturación en servicios independientes con despliegue continuo.", retrasado: false },
    { id: "p3", nombre: "App móvil de logística", cliente: "Logística Cantábrico", estado: "progreso", prioridad: "alta",
      progreso: 67, responsable: "u6", inicio: "20 ene", finEst: "10 jun", finReal: null, tareasPend: 5, tareasTot: 28, sinActividad: 9, descripcion: "Aplicación para conductores: rutas, firma de entregas e incidencias en tiempo real.", retrasado: true },
    { id: "p4", nombre: "Rediseño del checkout", cliente: "TecnoBrava S.L.", estado: "revision", prioridad: "media",
      progreso: 89, responsable: "u1", inicio: "08 abr", finEst: "02 jun", finReal: null, tareasPend: 2, tareasTot: 16, sinActividad: 2, descripcion: "Nuevo flujo de pago en un solo paso con validación de tarjeta en cliente.", retrasado: false },
    { id: "p5", nombre: "API de facturación", cliente: "Grupo Saimaza", estado: "bloqueado", prioridad: "alta",
      progreso: 34, responsable: "u2", inicio: "15 mar", finEst: "20 jul", finReal: null, tareasPend: 9, tareasTot: 22, sinActividad: 6, descripcion: "API REST para emisión de facturas electrónicas conforme a la normativa Verifactu.", retrasado: true },
    { id: "p6", nombre: "Panel de analítica interna", cliente: "Interno", estado: "pendiente", prioridad: "baja",
      progreso: 8, responsable: "u6", inicio: "26 may", finEst: "30 ago", finReal: null, tareasPend: 14, tareasTot: 15, sinActividad: 0, descripcion: "Cuadro de mando con métricas de uso y rendimiento de los productos del departamento.", retrasado: false },
    { id: "p7", nombre: "Integración pasarela de pago", cliente: "Clínicas Núñez", estado: "finalizado", prioridad: "media",
      progreso: 100, responsable: "u1", inicio: "02 ene", finEst: "28 feb", finReal: "26 feb", tareasPend: 0, tareasTot: 19, sinActividad: 14, descripcion: "Integración de Redsys y Stripe con conciliación automática de cobros.", retrasado: false },
    { id: "p8", nombre: "Onboarding automatizado", cliente: "Editorial Aralar", estado: "progreso", prioridad: "media",
      progreso: 52, responsable: "u5", inicio: "11 mar", finEst: "18 jul", finReal: null, tareasPend: 8, tareasTot: 20, sinActividad: 3, descripcion: "Secuencia de alta de usuarios con verificación de identidad y firma de contratos.", retrasado: false },
  ];

  // estado tarea: pendiente | progreso | bloqueada | finalizada
  const tareas = [
    { id: "t1",  proyecto: "p1", titulo: "Diseñar esquema del carrito recurrente", estado: "bloqueada",  prioridad: "critica", asignado: "u3", est: 16, hechas: 11, limite: "29 may", vencida: true },
    { id: "t2",  proyecto: "p1", titulo: "Endpoint de catálogo paginado",          estado: "progreso",   prioridad: "alta",    asignado: "u4", est: 12, hechas: 7,  limite: "03 jun", vencida: false },
    { id: "t3",  proyecto: "p1", titulo: "Maquetar vista de seguimiento de envío",  estado: "pendiente",  prioridad: "media",   asignado: "u1", est: 8,  hechas: 0,  limite: "06 jun", vencida: false },
    { id: "t4",  proyecto: "p1", titulo: "Integrar SSO del cliente",                estado: "bloqueada",  prioridad: "alta",    asignado: "u8", est: 10, hechas: 4,  limite: "28 may", vencida: true },
    { id: "t5",  proyecto: "p4", titulo: "Validación de tarjeta en cliente",        estado: "progreso",   prioridad: "media",   asignado: "u1", est: 6,  hechas: 5,  limite: "31 may", vencida: false },
    { id: "t6",  proyecto: "p4", titulo: "Pruebas E2E del flujo de pago",           estado: "pendiente",  prioridad: "alta",    asignado: "u5", est: 9,  hechas: 0,  limite: "01 jun", vencida: false },
    { id: "t7",  proyecto: "p2", titulo: "Extraer servicio de facturación",         estado: "progreso",   prioridad: "alta",    asignado: "u2", est: 24, hechas: 14, limite: "12 jun", vencida: false },
    { id: "t8",  proyecto: "p2", titulo: "Configurar malla de servicios",           estado: "pendiente",  prioridad: "media",   asignado: "u8", est: 16, hechas: 0,  limite: "20 jun", vencida: false },
    { id: "t9",  proyecto: "p5", titulo: "Adaptar modelo a Verifactu",              estado: "bloqueada",  prioridad: "alta",    asignado: "u3", est: 20, hechas: 6,  limite: "27 may", vencida: true },
    { id: "t10", proyecto: "p3", titulo: "Firma de entregas sin conexión",          estado: "progreso",   prioridad: "alta",    asignado: "u4", est: 14, hechas: 9,  limite: "05 jun", vencida: false },
    { id: "t11", proyecto: "p8", titulo: "Verificación de identidad documental",    estado: "progreso",   prioridad: "media",   asignado: "u5", est: 12, hechas: 6,  limite: "10 jun", vencida: false },
    { id: "t12", proyecto: "p1", titulo: "Auditar accesibilidad del catálogo",      estado: "pendiente",  prioridad: "baja",    asignado: "u1", est: 5,  hechas: 0,  limite: "14 jun", vencida: false },
  ];

  // estado bloqueo: activo | resuelto
  const bloqueos = [
    { id: "b1", proyecto: "p1", titulo: "Esperando credenciales del SSO del cliente", estado: "activo", severidad: "alta", creadoPor: "u8", fecha: "hace 3 d", dias: 3,
      descripcion: "El cliente no ha entregado el certificado del proveedor de identidad. Bloquea login y catálogo personalizado." },
    { id: "b2", proyecto: "p1", titulo: "Decisión pendiente sobre el modelo de carrito recurrente", estado: "activo", severidad: "critica", creadoPor: "u3", fecha: "hace 5 d", dias: 5,
      descripcion: "Falta validar con negocio si los pedidos recurrentes se editan o se clonan. Frena el diseño del esquema." },
    { id: "b3", proyecto: "p5", titulo: "Especificación de Verifactu incompleta", estado: "activo", severidad: "alta", creadoPor: "u3", fecha: "hace 6 d", dias: 6,
      descripcion: "La AEAT no ha publicado el detalle del campo de huella encadenada. Bloquea la firma de facturas." },
    { id: "b4", proyecto: "p3", titulo: "Dispositivos de prueba no disponibles", estado: "resuelto", severidad: "media", creadoPor: "u6", fecha: "hace 8 d", dias: 0,
      descripcion: "Faltaban terminales Android antiguos para QA. Resuelto con flota de dispositivos en la nube." },
  ];

  // estado oportunidad: borrador | enviado | negociacion | aceptado | rechazado | sin_respuesta
  const oportunidades = [
    { id: "o1", cliente: "Distribuciones Vega", titulo: "Ampliación Portal B2B — Fase 2", importe: 48000, responsable: "u7", fechaEnvio: "14 may", diasEnvio: 16, estado: "negociacion", prob: 70, ultSeguimiento: 2,
      descripcion: "Módulo de devoluciones y panel de administración de descuentos por volumen." },
    { id: "o2", cliente: "Logística Cantábrico", titulo: "App conductores — mantenimiento anual", importe: 22000, responsable: "u7", fechaEnvio: "02 may", diasEnvio: 28, estado: "sin_respuesta", prob: 40, ultSeguimiento: 19,
      descripcion: "Soporte, evolutivos y SLA de 24h para la aplicación de logística." },
    { id: "o3", cliente: "TecnoBrava S.L.", titulo: "Plataforma de comercio headless", importe: 95000, responsable: "u9", fechaEnvio: "21 may", diasEnvio: 9, estado: "enviado", prob: 55, ultSeguimiento: 9,
      descripcion: "Migración del e-commerce a arquitectura headless con CMS desacoplado." },
    { id: "o4", cliente: "Grupo Saimaza", titulo: "Integración ERP — facturación electrónica", importe: 63000, responsable: "u7", fechaEnvio: "09 may", diasEnvio: 21, estado: "negociacion", prob: 80, ultSeguimiento: 12,
      descripcion: "Conector entre el ERP del cliente y la nueva API de facturación Verifactu." },
    { id: "o5", cliente: "Clínicas Núñez", titulo: "Portal de citas para pacientes", importe: 37000, responsable: "u9", fechaEnvio: "27 may", diasEnvio: 3, estado: "enviado", prob: 50, ultSeguimiento: 3,
      descripcion: "Reserva de citas online con recordatorios y pago anticipado de consultas." },
    { id: "o6", cliente: "Editorial Aralar", titulo: "Suscripciones digitales", importe: 29500, responsable: "u9", fechaEnvio: "30 abr", diasEnvio: 30, estado: "sin_respuesta", prob: 65, ultSeguimiento: 22,
      descripcion: "Modelo de suscripción con muro de pago y gestión de licencias por centro educativo." },
    { id: "o7", cliente: "Mobiliario Duero", titulo: "Configurador de producto 3D", importe: 71000, responsable: "u7", fechaEnvio: "28 may", diasEnvio: 2, estado: "borrador", prob: 35, ultSeguimiento: 0,
      descripcion: "Configurador visual de muebles a medida con presupuesto instantáneo." },
    { id: "o8", cliente: "Seguros Altamira", titulo: "Renovación licencia panel analítica", importe: 18000, responsable: "u9", fechaEnvio: "18 abr", diasEnvio: 42, estado: "aceptado", prob: 100, ultSeguimiento: 5,
      descripcion: "Renovación anual del cuadro de mando con dos cuadros nuevos." },
  ];

  // participantes por proyecto: rol = responsable | colaborador | consultado
  const participantes = {
    p1: [ {u:"u1",rol:"responsable"},{u:"u3",rol:"colaborador"},{u:"u4",rol:"colaborador"},{u:"u8",rol:"colaborador"},{u:"u7",rol:"consultado"} ],
    p2: [ {u:"u2",rol:"responsable"},{u:"u8",rol:"colaborador"},{u:"u3",rol:"colaborador"},{u:"u1",rol:"consultado"} ],
    p3: [ {u:"u6",rol:"responsable"},{u:"u4",rol:"colaborador"},{u:"u5",rol:"colaborador"} ],
    p4: [ {u:"u1",rol:"responsable"},{u:"u5",rol:"colaborador"},{u:"u4",rol:"consultado"} ],
    p5: [ {u:"u2",rol:"responsable"},{u:"u3",rol:"colaborador"},{u:"u7",rol:"consultado"} ],
    p6: [ {u:"u6",rol:"responsable"},{u:"u8",rol:"colaborador"} ],
    p7: [ {u:"u1",rol:"responsable"},{u:"u5",rol:"colaborador"} ],
    p8: [ {u:"u5",rol:"responsable"},{u:"u4",rol:"colaborador"},{u:"u3",rol:"colaborador"} ],
  };

  // actividad: tipo = tarea | bloqueo | estado | comentario | proyecto | oportunidad
  const actividad = [
    { id:"a1", tipo:"bloqueo",     user:"u3", cuando:"hace 18 min", proyecto:"p1", texto:"abrió un bloqueo crítico en", objeto:"modelo de carrito recurrente" },
    { id:"a2", tipo:"tarea",       user:"u4", cuando:"hace 42 min", proyecto:"p3", texto:"completó", objeto:"Firma de entregas sin conexión" },
    { id:"a3", tipo:"estado",      user:"u1", cuando:"hace 1 h",    proyecto:"p4", texto:"movió a revisión el proyecto", objeto:"Rediseño del checkout" },
    { id:"a4", tipo:"oportunidad", user:"u7", cuando:"hace 2 h",    proyecto:null, texto:"avanzó a negociación", objeto:"Grupo Saimaza — Integración ERP" },
    { id:"a5", tipo:"tarea",       user:"u8", cuando:"hace 3 h",    proyecto:"p1", texto:"marcó como bloqueada", objeto:"Integrar SSO del cliente" },
    { id:"a6", tipo:"comentario",  user:"u2", cuando:"hace 4 h",    proyecto:"p2", texto:"comentó en", objeto:"Extraer servicio de facturación" },
    { id:"a7", tipo:"proyecto",    user:"u6", cuando:"hace 5 h",    proyecto:"p6", texto:"creó el proyecto", objeto:"Panel de analítica interna" },
    { id:"a8", tipo:"tarea",       user:"u5", cuando:"ayer 17:30",  proyecto:"p8", texto:"empezó", objeto:"Verificación de identidad documental" },
    { id:"a9", tipo:"bloqueo",     user:"u6", cuando:"ayer 11:05",  proyecto:"p3", texto:"resolvió el bloqueo de", objeto:"dispositivos de prueba" },
    { id:"a10",tipo:"estado",      user:"u1", cuando:"ayer 09:12",  proyecto:"p7", texto:"finalizó el proyecto", objeto:"Integración pasarela de pago" },
  ];

  // timeline específico por proyecto (para detalle)
  const timeline = {
    p1: [
      { tipo:"bloqueo",    user:"u3", cuando:"hace 18 min", texto:"abrió un bloqueo crítico: modelo de carrito recurrente" },
      { tipo:"tarea",      user:"u8", cuando:"hace 3 h",    texto:"marcó como bloqueada «Integrar SSO del cliente»" },
      { tipo:"comentario", user:"u4", cuando:"hace 6 h",    texto:"«El endpoint de catálogo ya pagina, falta caché»" },
      { tipo:"tarea",      user:"u4", cuando:"ayer 16:20",  texto:"avanzó «Endpoint de catálogo paginado» al 60%" },
      { tipo:"bloqueo",    user:"u8", cuando:"hace 3 d",    texto:"abrió un bloqueo: credenciales del SSO" },
      { tipo:"estado",     user:"u1", cuando:"hace 4 d",    texto:"subió la prioridad del proyecto a Crítica" },
    ],
  };

  window.POD = {
    users, proyectos, tareas, bloqueos, oportunidades, participantes, actividad, timeline,
    currentUser: "u1",
    byId(list, id) { return list.find(function (x) { return x.id === id; }); },
    user(id) { return users.find(function (u) { return u.id === id; }); },
    fmtEur(n) { return new Intl.NumberFormat("es-ES").format(n) + " €"; },
  };
})();
