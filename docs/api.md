# Contrato de API — POD

API REST bajo el prefijo `/api`. Autenticación JWT/Bearer salvo en login. Respuestas en JSON. Errores con códigos HTTP estándar y cuerpo `{ "error": "...", "details": {...} }`.

## Convenciones

- Colecciones: `GET /api/<recurso>` admite filtros por query string y paginación `?page=1&limit=25`.
- Fechas en ISO-8601.
- Los enums viajan con su valor backing string (p. ej. `"en_progreso"`).
- Autorización por rol/voter; un `403` indica permiso insuficiente.

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/login` | `{ email, password }` → `{ token, user }` |
| GET | `/api/me` | Usuario autenticado actual |

## Usuarios

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/api/users` | Manager/Admin | Lista de usuarios |
| POST | `/api/users` | Admin | Crear usuario |
| GET | `/api/users/{id}` | — | Detalle |
| PATCH | `/api/users/{id}` | Admin/propio | Actualizar |
| GET | `/api/users/{id}/workload` | Manager | Carga: proyectos asignados, tareas abiertas |

## Oportunidades (comercial)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/opportunities` | Lista. Filtros: `estado`, `responsable`, `q` |
| POST | `/api/opportunities` | Crear |
| GET | `/api/opportunities/{id}` | Detalle |
| PATCH | `/api/opportunities/{id}` | Actualizar (incluye cambio de `estado`) |
| POST | `/api/opportunities/{id}/follow-up` | Registrar seguimiento (actualiza `fechaUltimaAccion`) |
| POST | `/api/opportunities/{id}/generate-project` | Lanza el asistente IA → devuelve un **borrador** (no persiste proyecto) |

## Proyectos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/projects` | Lista. Filtros: `estado`, `prioridad`, `responsable`, `activo` |
| POST | `/api/projects` | Crear |
| GET | `/api/projects/{id}` | Detalle (cabecera + agregados) |
| PATCH | `/api/projects/{id}` | Actualizar (estado, prioridad, fechas, progreso...) |
| GET | `/api/projects/{id}/tasks` | Tareas del proyecto |
| GET | `/api/projects/{id}/activity` | Timeline del proyecto |
| GET | `/api/projects/{id}/members` | Participantes |
| POST | `/api/projects/{id}/members` | Añadir participante `{ usuario, rol }` |
| DELETE | `/api/projects/{id}/members/{usuarioId}` | Eliminar participante |

## Tareas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/tasks` | Crear `{ proyecto, titulo, ... }` |
| GET | `/api/tasks/{id}` | Detalle |
| PATCH | `/api/tasks/{id}` | Actualizar (estado, asignado, horas, etc.) |
| DELETE | `/api/tasks/{id}` | Eliminar |

## Bloqueos

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/blockers` | Crear `{ proyecto, tarea?, descripcion }` |
| PATCH | `/api/blockers/{id}` | Resolver `{ resuelto: true }` |
| GET | `/api/blockers?resuelto=false` | Bloqueos activos |

## Dashboards (endpoints agregados)

Pensados para llenar cada pantalla con una sola petición.

| Método | Ruta | Devuelve |
|--------|------|----------|
| GET | `/api/dashboard/me` | Mis proyectos, mis tareas (por prioridad), mis bloqueos, mi actividad |
| GET | `/api/dashboard/department` | Conteos de proyectos por estado, carga por usuario, riesgos, feed global |
| GET | `/api/dashboard/sales` | Oportunidades activas + alertas comerciales |

### Riesgos (dentro de `/api/dashboard/department`)

- Proyectos sin actividad > X días.
- Proyectos con bloqueos abiertos.
- Proyectos con tareas vencidas.
- Proyectos retrasados (fin estimado pasado y no finalizado).

### Alertas comerciales (dentro de `/api/dashboard/sales`)

- Oportunidades > X días sin respuesta.
- Oportunidades > X días sin seguimiento.
- Alta probabilidad sin actividad reciente.

## Actividad

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/activity` | Feed global paginado. Filtros: `usuario`, `proyecto`, `tipo` |

## Asistente IA: presupuesto → proyecto

Flujo en dos pasos. La IA nunca crea el proyecto: produce un borrador editable que un humano confirma.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/ai/analyze` | `multipart/form-data` con documento (PDF/DOCX/texto) o `{ texto }`. Devuelve borrador estructurado |
| POST | `/api/projects/from-draft` | Recibe el borrador (ya revisado/editado) y crea proyecto + fases + tareas reales |

### Forma del borrador devuelto por `/api/ai/analyze`

```json
{
  "proyecto": { "nombre": "...", "descripcion": "...", "objetivos": ["..."] },
  "fases": [
    {
      "nombre": "Backend",
      "tareas": [
        { "titulo": "Diseño base de datos", "estimacionHoras": 8 },
        { "titulo": "Desarrollo API", "estimacionHoras": 24 }
      ]
    }
  ],
  "riesgos": ["..."],
  "dependencias": ["..."],
  "estimaciones": { "totalHoras": 0, "notas": "..." }
}
```

El frontend muestra este borrador en modo edición (estado "pendiente de validar"); al confirmar, llama a `/api/projects/from-draft`.
