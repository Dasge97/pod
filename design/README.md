# design/

Carpeta para el **diseño de la interfaz generado con Claude design**.

## Qué va aquí

Pega aquí los artifacts que produzca Claude design a partir del prompt de [docs/prompt-diseno.md](../docs/prompt-diseno.md): componentes React + Tailwind CSS + shadcn/ui de cada pantalla.

Sugerencia de organización (orienta, no es obligatoria):

```
design/
├── dashboard-personal/
├── dashboard-departamental/
├── dashboard-comercial/
├── detalle-proyecto/
├── detalle-oportunidad/
└── asistente-ia/
```

## Para qué se usa

Este diseño es la **referencia visual y de componentes** del frontend. Durante la
construcción (ver [docs/construccion.md](../docs/construccion.md), Fase 7) se porta a
`frontend/src/` y se conecta a la API real definida en [docs/api.md](../docs/api.md).

> El contenido de `design/` es referencia de diseño: puede contener datos mock. La lógica
> real, el modelo de datos y los endpoints están en `docs/`.
