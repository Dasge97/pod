# Modelo de datos — POD

Entidades Doctrine, campos, tipos, relaciones y enumerados. Es la fuente de verdad para generar entidades y migraciones.

## Diagrama de relaciones

```text
Usuario ──< ProyectoUsuario >── Proyecto ──< Tarea
   │                              │            │
   │                              │            │
   └──< Actividad >───────────────┘            │
                                  Proyecto ──< Bloqueo >── Tarea
   Oportunidad ──(genera)──> Proyecto
   Usuario ──(responsable_comercial)──> Oportunidad
```

## Enumerados (PHP `enum` con backing string)

```php
enum RolUsuario: string {
    case Developer = 'developer';
    case ProjectManager = 'project_manager';
    case Sales = 'sales';
    case DeptManager = 'dept_manager';
    case Admin = 'admin';
}

enum EstadoOportunidad: string {
    case Borrador = 'borrador';
    case Enviado = 'enviado';
    case EnNegociacion = 'en_negociacion';
    case Aceptado = 'aceptado';
    case Rechazado = 'rechazado';
    case SinRespuesta = 'sin_respuesta';
}

enum EstadoProyecto: string {
    case Pendiente = 'pendiente';
    case EnProgreso = 'en_progreso';
    case Bloqueado = 'bloqueado';
    case EnRevision = 'en_revision';
    case Finalizado = 'finalizado';
}

enum Prioridad: string {
    case Baja = 'baja';
    case Media = 'media';
    case Alta = 'alta';
    case Critica = 'critica';
}

enum EstadoTarea: string {
    case Pendiente = 'pendiente';
    case EnProgreso = 'en_progreso';
    case Bloqueada = 'bloqueada';
    case Finalizada = 'finalizada';
}

enum RolProyecto: string {
    case Responsable = 'responsable';
    case Colaborador = 'colaborador';
    case Consultado = 'consultado';
}

enum TipoActividad: string {
    case ProyectoCreado = 'proyecto_creado';
    case ProyectoActualizado = 'proyecto_actualizado';
    case TareaCreada = 'tarea_creada';
    case TareaCompletada = 'tarea_completada';
    case BloqueoCreado = 'bloqueo_creado';
    case BloqueoResuelto = 'bloqueo_resuelto';
    case ParticipanteAnadido = 'participante_anadido';
    case ParticipanteEliminado = 'participante_eliminado';
    case OportunidadCreada = 'oportunidad_creada';
    case OportunidadActualizada = 'oportunidad_actualizada';
    case OportunidadAceptada = 'oportunidad_aceptada';
    case OportunidadRechazada = 'oportunidad_rechazada';
}
```

## Entidades

### Usuario

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int (PK) | autogenerado |
| nombre | string(120) | |
| email | string(180) | único |
| password | string | hash; no se expone |
| avatar | string(255) nullable | URL |
| rol | `RolUsuario` | mapea a roles Symfony |
| activo | bool | default true |
| fechaCreacion | datetime_immutable | |

Relaciones: `OneToMany` con ProyectoUsuario, Actividad. Como comercial: `OneToMany` con Oportunidad.

### Oportunidad

Representa un presupuesto enviado al cliente.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int (PK) | |
| nombre | string(180) | |
| cliente | string(180) | |
| responsableComercial | Usuario (ManyToOne) | |
| importe | decimal(12,2) | |
| fechaEnvio | date nullable | |
| fechaUltimaAccion | datetime nullable | para alertas de seguimiento |
| estado | `EstadoOportunidad` | |
| probabilidad | int (0–100) | |
| proyectoGenerado | Proyecto (OneToOne, nullable) | proyecto creado a partir de ella |

### Proyecto

Unidad principal del sistema.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int (PK) | |
| oportunidad | Oportunidad (ManyToOne, nullable) | origen comercial |
| nombre | string(180) | |
| descripcion | text nullable | |
| responsable | Usuario (ManyToOne) | |
| estado | `EstadoProyecto` | |
| prioridad | `Prioridad` | |
| progreso | int (0–100) | calculado o manual |
| fechaInicio | date nullable | |
| fechaFinEstimada | date nullable | |
| fechaFinReal | date nullable | |
| activo | bool | default true |

Relaciones: `OneToMany` con Tarea, ProyectoUsuario, Bloqueo, Actividad.

Derivados para riesgos (calculados en servicio/repositorio, no columnas): última actividad, nº bloqueos abiertos, nº tareas vencidas, retraso (fechaFinEstimada < hoy y no finalizado).

### ProyectoUsuario

Tabla de unión proyecto–usuario con rol.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int (PK) | |
| proyecto | Proyecto (ManyToOne) | |
| usuario | Usuario (ManyToOne) | |
| rol | `RolProyecto` | Responsable / Colaborador / Consultado |

Restricción única: (`proyecto`, `usuario`).

### Tarea

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int (PK) | |
| proyecto | Proyecto (ManyToOne) | |
| titulo | string(180) | |
| descripcion | text nullable | |
| asignado | Usuario (ManyToOne, nullable) | |
| estado | `EstadoTarea` | |
| prioridad | `Prioridad` | |
| estimacionHoras | float nullable | |
| horasConsumidas | float nullable | default 0 |
| fechaCreacion | datetime_immutable | |
| fechaLimite | date nullable | vencida si < hoy y no finalizada |

### Bloqueo

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int (PK) | |
| proyecto | Proyecto (ManyToOne) | |
| tarea | Tarea (ManyToOne, nullable) | bloqueo a nivel tarea o proyecto |
| descripcion | text | |
| creadoPor | Usuario (ManyToOne) | |
| fechaCreacion | datetime_immutable | |
| resuelto | bool | default false |
| fechaResolucion | datetime nullable | |

### Actividad

Feed de eventos. Se genera automáticamente desde servicios/subscribers.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int (PK) | |
| usuario | Usuario (ManyToOne, nullable) | autor de la acción |
| proyecto | Proyecto (ManyToOne, nullable) | contexto |
| tipo | `TipoActividad` | |
| descripcion | string(255) | texto legible ("Dani completó la tarea X") |
| fecha | datetime_immutable | |

## Notas de implementación

- Todos los `enum` se mapean con el tipo nativo de Doctrine para enums PHP.
- Borrado: preferir `activo = false` (soft) en Usuario/Proyecto antes que borrado físico.
- Índices recomendados: `Actividad(fecha)`, `Tarea(estado, fechaLimite)`, `Proyecto(estado)`, `Oportunidad(estado, fechaUltimaAccion)`.
- Las métricas de los dashboards (carga por usuario, riesgos, alertas comerciales) se resuelven en métodos de Repository, no en el frontend.
