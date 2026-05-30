# Arquitectura técnica — POD

Este documento define el stack, la estructura del repositorio y las decisiones técnicas. Junto con [modelo-datos.md](modelo-datos.md), [api.md](api.md) y el diseño en [`design/`](../design/), contiene todo lo necesario para construir la aplicación.

## Stack

### Backend

- **PHP 8.3+ / Symfony 7** — API REST.
- **Doctrine ORM + Doctrine Migrations** — persistencia y esquema.
- **MySQL 8** — base de datos.
- **LexikJWTAuthenticationBundle** — autenticación JWT/Bearer.
- **NelmioCorsBundle** — CORS para el frontend.
- **Capa de IA con proveedor configurable (OpenAI o Anthropic)** — análisis de presupuestos y generación de borradores de proyecto. Ver [Capa de IA](#capa-de-ia).

Arquitectura clásica de API por carpetas técnicas (ver [Estructura backend](#estructura-backend)). Controladores finos, lógica en servicios, persistencia con Doctrine. Sin arquitectura modular ni Symfony Messenger salvo necesidad real.

### Frontend

- **React 18 + Vite + TypeScript**.
- **Tailwind CSS + shadcn/ui** — sistema de componentes (es lo que genera Claude design, por eso el diseño es portable directo).
- **TanStack Query** — datos remotos, cache y refetch de los dashboards.
- **React Router** — navegación.
- **Zustand** — estado global ligero (sesión/usuario).
- **axios** — cliente HTTP con interceptor para el token Bearer.

### Diseño

- **Claude design** genera los componentes (React + Tailwind + shadcn/ui).
- Los artifacts se pegan en [`design/`](../design/) y se integran en `frontend/` durante la construcción (ver [construccion.md](construccion.md)).

## Estructura del repositorio

```
pod/
├── backend/      # API Symfony
├── frontend/     # SPA React
├── design/       # artifacts de Claude design (referencia de diseño)
└── docs/         # esta documentación
```

### Estructura backend

```
backend/
├── src/
│   ├── Controller/        # endpoints HTTP/API (finos)
│   ├── Service/           # lógica de aplicación y negocio
│   ├── Entity/            # entidades Doctrine
│   ├── Repository/        # consultas y persistencia
│   ├── DTO/               # request/response payloads
│   ├── Security/          # JWT, voters, autorización
│   ├── EventSubscriber/   # comportamiento transversal (actividad, etc.)
│   └── Command/           # seeds, jobs, mantenimiento
├── config/
│   ├── packages/*.yaml
│   └── services.yaml
├── migrations/
└── .env
```

Convenciones:

- Rutas con **atributos PHP** (`#[Route]`).
- **Autowiring/autoconfigure** activados.
- DTOs para entrada (validación con `symfony/validator`) y salida (serialización controlada).
- Toda acción relevante de negocio genera una `Actividad` (ver [modelo-datos.md](modelo-datos.md)), preferiblemente desde un servicio o un `EventSubscriber`.

### Estructura frontend

```
frontend/
├── src/
│   ├── components/    # componentes de UI (provenientes de design/, adaptados)
│   │   └── ui/        # primitivas shadcn/ui
│   ├── pages/         # una por vista de alto nivel (dashboards, detalles)
│   ├── features/      # lógica por dominio (proyectos, tareas, oportunidades...)
│   ├── api/           # cliente axios + hooks de TanStack Query por recurso
│   ├── stores/        # Zustand (sesión)
│   ├── lib/           # utilidades (formato fechas, helpers de estado/badge)
│   ├── routes.tsx
│   └── main.tsx
├── index.html
└── vite.config.ts
```

## Autenticación y autorización

- Login (`POST /api/login`) devuelve un **JWT**. El frontend lo guarda y lo envía como `Authorization: Bearer <token>`.
- Roles del sistema (Symfony roles): `ROLE_DEVELOPER`, `ROLE_PROJECT_MANAGER`, `ROLE_SALES`, `ROLE_DEPT_MANAGER`, `ROLE_ADMIN`.
- Autorización de grano fino con **voters** en `src/Security/` (p. ej. "¿puede este usuario gestionar este proyecto?").
- CORS configurado para el origen del frontend.

## Capa de IA

El análisis de presupuestos no depende de un proveedor concreto: se accede a través de una abstracción para poder usar **OpenAI o Anthropic** de forma intercambiable.

- Interfaz `AiClientInterface` en `src/Service/Ai/` con una operación que recibe el texto del presupuesto y devuelve el borrador estructurado (forma en [api.md](api.md)).
- Dos implementaciones: `OpenAiClient` y `AnthropicClient`.
- El proveedor activo se elige por configuración (`AI_PROVIDER=openai|anthropic`) mediante un alias de servicio en `services.yaml`; el resto del código depende solo de la interfaz.
- Claves por entorno: `OPENAI_API_KEY` y/o `ANTHROPIC_API_KEY`. Modelo por proveedor configurable (`AI_MODEL`).
- El servicio se encarga de extraer el texto del documento (PDF/DOCX) antes de llamar al proveedor.

## Decisiones y límites (qué NO hacer)

- No CRM/ERP/tickets/control horario: el alcance es el panel operativo del [spec](spec.md).
- No microservicios ni colas. Un backend Symfony + un frontend React.
- La IA **nunca** persiste un proyecto directamente: genera un borrador que un humano confirma.
- Mantener todo simple y mantenible; cada capa debe justificarse.
