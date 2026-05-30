# Prompt para Claude design

Pega este prompt en Claude design para generar la interfaz. Genera **React + Tailwind CSS + shadcn/ui**, que es el stack del frontend (ver [arquitectura.md](arquitectura.md)), por lo que el resultado es directamente integrable.

Una vez generado, pega los artifacts en la carpeta [`design/`](../design/) y sigue [construccion.md](construccion.md).

---

```text
Eres un diseñador de producto experto en herramientas internas tipo dashboard B2B.
Diseña la interfaz web de una aplicación llamada POD (Panel Operativo de Desarrollo).

== QUÉ ES Y PARA QUÉ SIRVE ==
POD es una herramienta interna que sustituye las pizarras físicas de un departamento de
desarrollo de software. Centraliza el estado operativo del equipo: proyectos, tareas,
responsables, bloqueos y presupuestos comerciales. NO es un CRM, ni un ERP, ni un sistema
de tickets, ni control horario.

La métrica de éxito del producto es UNA sola y debe guiar todo el diseño:
"Cualquier persona del equipo debe entender qué está pasando, qué está pendiente y qué
requiere atención en MENOS DE 30 SEGUNDOS."
Prioriza claridad, densidad informativa bien jerarquizada y lectura rápida sobre la
decoración. Es una herramienta de uso diario para gente técnica.

== USUARIOS Y ROLES ==
- Desarrollador: ve sus proyectos y tareas, actualiza estados, registra bloqueos.
- Responsable de proyecto: gestiona proyectos, tareas, participantes y resuelve bloqueos.
- Responsable comercial: gestiona oportunidades/presupuestos y su seguimiento.
- Responsable de departamento: visión global, riesgos, carga de trabajo, prioridades.
- Administrador: control total.

== FLUJO CENTRAL DEL PRODUCTO ==
Presupuesto → Oportunidad → Proyecto → Tareas → Actividad operativa.
La información de la venta se reutiliza en la ejecución.

== PANTALLAS A DISEÑAR ==

1. DASHBOARD PERSONAL ("¿En qué estoy trabajando?")
   - Mis proyectos (estado, progreso %, responsable, nº tareas pendientes).
   - Mis tareas ordenadas por prioridad.
   - Mis bloqueos activos (destacados visualmente).
   - Actividad reciente relevante para mí.

2. DASHBOARD DEPARTAMENTAL ("¿Cómo está el departamento?")
   - Proyectos: activos / bloqueados / finalizados / retrasados (con conteos y estado).
   - Usuarios: proyectos asignados, tareas abiertas, indicador de carga de trabajo.
   - Riesgos: proyectos sin actividad X días, con bloqueos abiertos, con tareas vencidas.
   - Feed de actividad global del departamento.

3. DASHBOARD COMERCIAL ("¿Qué presupuestos siguen abiertos?")
   - Oportunidades activas: cliente, importe, responsable, días desde envío, estado,
     probabilidad.
   - Alertas: >X días sin respuesta, >X días sin seguimiento, alta probabilidad sin
     actividad reciente.

4. DETALLE DE PROYECTO
   - Cabecera: nombre, estado, prioridad, progreso, responsable, fechas (inicio/fin
     estimada/real).
   - Lista de tareas (estado, asignado, prioridad, estimación vs horas consumidas, fecha límite).
   - Participantes (roles: Responsable / Colaborador / Consultado).
   - Bloqueos del proyecto.
   - Timeline de actividad del proyecto.

5. DETALLE DE OPORTUNIDAD (presupuesto)
   - Datos: cliente, importe, responsable comercial, fechas, estado, probabilidad.
   - Estados: Borrador, Enviado, En negociación, Aceptado, Rechazado, Sin respuesta.
   - Acción destacada: "Generar proyecto con IA" a partir del presupuesto.

6. ASISTENTE IA: PRESUPUESTO → PROYECTO
   - Pantalla de subida de documento (PDF, DOCX, texto, correo).
   - Vista de BORRADOR generado por IA y EDITABLE antes de confirmar: nombre y descripción
     del proyecto, fases (Análisis, Backend, Frontend, Testing, Despliegue), tareas iniciales
     por fase, riesgos detectados, dependencias, estimaciones.
   - La IA NUNCA crea el proyecto directamente: siempre hay revisión y confirmación humana.
     Deja claro en la UI el estado "borrador pendiente de validar".

== ESTADOS Y BADGES (necesitan color/iconografía consistente) ==
- Proyecto: Pendiente, En progreso, Bloqueado, En revisión, Finalizado.
- Prioridad: Baja, Media, Alta, Crítica.
- Tarea: Pendiente, En progreso, Bloqueada, Finalizada.
- Bloqueo: activo / resuelto.

== DIRECCIÓN DE DISEÑO ==
- Layout de aplicación: barra lateral de navegación + área de contenido. Selector/conmutador
  entre los 3 dashboards según rol.
- Estética: limpia, profesional, moderna, tipo panel operativo (referencias: Linear, Vercel
  dashboard, Height). Modo claro y modo oscuro.
- Componentes: tarjetas de métricas (KPIs) arriba, tablas/listas densas pero legibles,
  badges de estado y prioridad muy reconocibles de un vistazo, barras de progreso, feed de
  actividad tipo timeline con avatares.
- Los elementos que "requieren atención" (bloqueos, retrasos, alertas comerciales) deben
  saltar a la vista mediante color (rojo/ámbar) sin saturar el resto.
- Componentes basados en React + Tailwind CSS + shadcn/ui.
- Diseño responsive (uso principal en escritorio, pero usable en tablet).

Empieza por el DASHBOARD PERSONAL y el DASHBOARD DEPARTAMENTAL, que son las pantallas que
mejor demuestran la promesa de "entenderlo todo en 30 segundos".
```
