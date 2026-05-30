# Plan de construcción — POD

Secuencia para construir la aplicación una vez que el diseño esté en [`design/`](../design/). Cada fase es verificable antes de pasar a la siguiente.

## Punto de partida

Antes de empezar a construir deben existir:

- Esta documentación (`docs/`).
- El diseño generado por Claude design pegado en `design/` (ver [design/README.md](../design/README.md)).

Con eso, construir es ejecución guiada por [arquitectura.md](arquitectura.md), [modelo-datos.md](modelo-datos.md) y [api.md](api.md).

## Fase 0 — Entorno

- `docker-compose.yml` con PostgreSQL 16 (y opcionalmente Adminer).
- Variables de entorno: `DATABASE_URL`, `JWT_*`, `CORS_ALLOW_ORIGIN`, `ANTHROPIC_API_KEY`.

## Fase 1 — Backend: esqueleto y datos

1. `composer create-project symfony/skeleton backend` + paquetes: orm, migrations, maker, security, lexik/jwt, nelmio/cors, validator, serializer.
2. Crear los **enums** y **entidades** de [modelo-datos.md](modelo-datos.md) en `src/Entity/`.
3. Generar y ejecutar migraciones (`doctrine:migrations`).
4. `Command` de seed con datos de ejemplo (usuarios de cada rol, proyectos, tareas, oportunidades, actividad) para poder ver los dashboards con datos reales.

**Verificable:** esquema creado y seed cargado en PostgreSQL.

## Fase 2 — Backend: auth

1. Configurar LexikJWT (claves) y el firewall.
2. `POST /api/login`, `GET /api/me`.
3. Roles Symfony mapeados desde `RolUsuario`.

**Verificable:** login devuelve token; `/api/me` responde con Bearer.

## Fase 3 — Backend: API por recursos

1. Controladores finos en `src/Controller/` para usuarios, oportunidades, proyectos, tareas, bloqueos, actividad, según [api.md](api.md).
2. Lógica en `src/Service/`; consultas/agregados en `src/Repository/`.
3. DTOs de entrada (validados) y salida (serialización controlada) en `src/DTO/`.
4. Voters en `src/Security/` para autorización de grano fino.
5. Generación automática de `Actividad` desde servicios o un `EventSubscriber`.

**Verificable:** CRUD y filtros responden correctamente con permisos por rol.

## Fase 4 — Backend: endpoints de dashboard

1. `/api/dashboard/me`, `/api/dashboard/department`, `/api/dashboard/sales`.
2. Cálculo de riesgos y alertas comerciales en Repository/Service.

**Verificable:** cada endpoint devuelve todo lo que su pantalla necesita en una sola llamada.

## Fase 5 — Backend: asistente IA

1. `Service` que recibe documento/texto, llama a la **API de Claude** y devuelve el borrador con la forma de [api.md](api.md) (`/api/ai/analyze`).
2. Extracción de texto de PDF/DOCX antes de enviar a la IA.
3. `/api/projects/from-draft` crea proyecto + tareas a partir del borrador revisado.

**Verificable:** subir un presupuesto produce un borrador editable; confirmar crea el proyecto real.

## Fase 6 — Frontend: esqueleto

1. `npm create vite@latest frontend -- --template react-ts`.
2. Tailwind + shadcn/ui + TanStack Query + React Router + Zustand + axios.
3. Cliente API con interceptor Bearer y manejo de 401.
4. Estructura de carpetas de [arquitectura.md](arquitectura.md).

## Fase 7 — Frontend: integrar el diseño

1. Mover/portar los componentes de `design/` a `frontend/src/components` y `pages`.
2. Extraer primitivas shadcn a `components/ui`.
3. Unificar tema (colores de estado/prioridad, modo claro/oscuro) y helpers de badge en `lib/`.
4. Montar layout (sidebar + conmutador de dashboards) y rutas.

**Verificable:** la app navega entre todas las pantallas con datos mock.

## Fase 8 — Frontend: conectar a la API

1. Un hook de TanStack Query por recurso/endpoint (`api/`).
2. Sustituir mocks por datos reales de los endpoints de dashboard y de detalle.
3. Formularios y acciones (crear/editar proyecto, tarea, bloqueo, oportunidad; seguimiento; resolver bloqueo).
4. Login + guardado de sesión (Zustand) + rutas protegidas por rol.
5. Flujo completo del asistente IA (subida → borrador editable → confirmación).

**Verificable:** flujo end-to-end real contra el backend.

## Fase 9 — Cierre

- CORS y `.env` de producción.
- README de arranque (backend + frontend + docker).
- Repaso de la métrica de 30 segundos en cada dashboard: ¿se entiende el estado de un vistazo?

## Orden de prioridad de pantallas

Construir en este orden (el del prompt de diseño): **Dashboard personal → Dashboard departamental → Detalle de proyecto → Dashboard comercial → Detalle de oportunidad → Asistente IA.**
