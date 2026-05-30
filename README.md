# POD — Panel Operativo de Desarrollo

Herramienta interna para centralizar el estado operativo de un departamento de desarrollo de software. Sustituye las pizarras físicas y conecta la fase comercial (presupuestos) con la ejecución (proyectos y tareas).

Su métrica de éxito es una sola: **cualquier miembro de la organización debe poder entender qué está ocurriendo, qué está pendiente y qué requiere atención en menos de 30 segundos.**

## Qué es y qué no es

POD **es** un panel operativo, una herramienta de contexto y un puente entre comercial y desarrollo.

POD **no es** un CRM, un ERP, un sistema de tickets, un gestor documental ni un sistema de control horario.

## Flujo del sistema

```text
Presupuesto → Oportunidad → Proyecto → Tareas → Actividad Operativa
```

La información generada durante la venta se reutiliza durante la ejecución.

## Características principales

- Dashboards personal, departamental y comercial.
- Gestión de proyectos, tareas, participantes y bloqueos.
- Feed de actividad automático del departamento.
- IA que transforma presupuestos en borradores de proyecto (con validación humana).

## Stack

- **Backend:** PHP 8.3 / Symfony 7 · Doctrine ORM + Migrations · PostgreSQL · JWT (Lexik) · API de Claude para la IA.
- **Frontend:** React + Vite + TypeScript · Tailwind CSS + shadcn/ui · TanStack Query · React Router · Zustand.
- **Diseño:** Claude design (React + Tailwind + shadcn/ui), portado al frontend.

## Estructura del repositorio

```
pod/
├── backend/    # API Symfony (se crea en la fase de construcción)
├── frontend/   # SPA React (se crea en la fase de construcción)
├── design/     # diseño generado con Claude design
└── docs/       # documentación
```

## Documentación

- [Especificación funcional](docs/spec.md) — qué es y qué resuelve.
- [Arquitectura técnica](docs/arquitectura.md) — stack, estructura, decisiones.
- [Modelo de datos](docs/modelo-datos.md) — entidades, relaciones, enums.
- [Contrato de API](docs/api.md) — endpoints REST.
- [Prompt de diseño](docs/prompt-diseno.md) — prompt para Claude design.
- [Plan de construcción](docs/construccion.md) — fases para construir la app.

## Estado

En fase de especificación y diseño. La documentación está completa; el siguiente paso es
generar el diseño en [`design/`](design/) y construir la aplicación siguiendo
[docs/construccion.md](docs/construccion.md).
