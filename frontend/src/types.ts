// Tipos de los view-models que devuelve la API de POD (ver backend/src/Service/Presenter.php).

export type EstadoProyecto = 'pendiente' | 'progreso' | 'bloqueado' | 'revision' | 'finalizado'
export type EstadoTarea = 'pendiente' | 'progreso' | 'bloqueada' | 'finalizada'
export type Prioridad = 'baja' | 'media' | 'alta' | 'critica'
export type EstadoOportunidad =
  | 'borrador' | 'enviado' | 'negociacion' | 'aceptado' | 'rechazado' | 'sin_respuesta'
export type RolProyecto = 'responsable' | 'colaborador' | 'consultado'
export type FamiliaActividad = 'tarea' | 'bloqueo' | 'estado' | 'comentario' | 'proyecto' | 'oportunidad'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  rolLabel: string
  roles: string[]
  color: string
  iniciales: string
  avatar: string | null
  activo: boolean
  carga?: number
  tareasAbiertas?: number
}

export interface RefProyecto {
  id: number
  nombre: string
}

export interface ProyectoLite {
  id: number
  nombre: string
  cliente: string
  estado: EstadoProyecto
  estadoLabel: string
  prioridad: Prioridad
  prioridadLabel: string
  progreso: number
  responsable: Usuario | null
  tareasPend: number
  tareasTot: number
  retrasado: boolean
  diasSinActividad: number | null
}

export interface ProyectoDetalle extends ProyectoLite {
  descripcion: string | null
  fechaInicio: string | null
  fechaFinEstimada: string | null
  fechaFinReal: string | null
  activo: boolean
  oportunidadId: number | null
}

export interface Tarea {
  id: number
  titulo: string
  descripcion: string | null
  estado: EstadoTarea
  estadoLabel: string
  prioridad: Prioridad
  prioridadLabel: string
  asignado: Usuario | null
  estimacionHoras: number | null
  horasConsumidas: number
  fechaLimite: string | null
  vencida: boolean
  proyecto?: RefProyecto
}

export interface Bloqueo {
  id: number
  titulo: string
  descripcion: string | null
  severidad: Prioridad
  severidadLabel: string
  proyecto: RefProyecto | null
  tareaId: number | null
  creadoPor: Usuario | null
  fechaCreacion: string
  resuelto: boolean
  fechaResolucion: string | null
  diasAbierto: number
}

export interface Oportunidad {
  id: number
  nombre: string
  cliente: string
  descripcion: string | null
  importe: number
  responsable: Usuario | null
  estado: EstadoOportunidad
  estadoLabel: string
  probabilidad: number
  fechaEnvio: string | null
  diasEnvio: number | null
  diasSinSeguimiento: number | null
  proyectoGeneradoId: number | null
}

export interface Actividad {
  id: number
  tipo: string
  familia: FamiliaActividad
  texto: string
  objeto: string | null
  usuario: Usuario | null
  proyecto: RefProyecto | null
  fecha: string
}

export interface Participante {
  usuario: Usuario
  rol: RolProyecto
  rolLabel: string
}

export interface DashboardMe {
  usuario: Usuario
  kpis: {
    proyectosActivos: number
    proyectosTotales: number
    tareasPendientes: number
    tareasVencidas: number
    bloqueosActivos: number
    progresoMedio: number
  }
  proyectos: ProyectoLite[]
  tareas: Tarea[]
  bloqueos: Bloqueo[]
  actividad: Actividad[]
}

export interface RiesgoBloqueo { proyecto: ProyectoLite; bloqueos: number; diasMax: number }
export interface RiesgoSinActividad { proyecto: ProyectoLite; dias: number }
export interface RiesgoVencidas { proyecto: ProyectoLite; vencidas: number }

export type EstadoCarga = 'saturado' | 'ok' | 'holgura'

export interface ProyectoActivoRef {
  id: number
  nombre: string
  estado: EstadoProyecto
}

export interface MiembroEquipo {
  usuario: Usuario
  carga: number
  estado: EstadoCarga
  proyectos: number
  proyectosLidera: number
  tareasAbiertas: number
  tareasVencidas: number
  bloqueos: number
  proyectosActivos: ProyectoActivoRef[]
}

export interface DashboardDepartment {
  kpisEquipo: { personas: number; saturados: number; tareasVencidas: number; bloqueosActivos: number }
  kpisProyectos: { activos: number; total: number; bloqueados: number; retrasados: number; enRevision: number; finalizados: number }
  equipo: MiembroEquipo[]
  riesgos: {
    sinActividad: RiesgoSinActividad[]
    conBloqueos: RiesgoBloqueo[]
    conVencidas: RiesgoVencidas[]
  }
  proyectos: ProyectoLite[]
  actividad: Actividad[]
}

export interface PersonaOverview {
  usuario: Usuario
  kpis: {
    carga: number; estado: EstadoCarga; proyectos: number; proyectosLidera: number
    tareasAbiertas: number; tareasVencidas: number; bloqueos: number
  }
  proyectos: (ProyectoLite & { esResponsable: boolean })[]
  tareas: Tarea[]
  bloqueos: Bloqueo[]
}

export interface EmbudoItem { estado: EstadoOportunidad; label: string; n: number; importe: number }

export interface DashboardSales {
  kpis: { pipeline: number; ponderado: number; ganado: number; alertas: number }
  oportunidades: Oportunidad[]
  alertas: {
    sinRespuesta: Oportunidad[]
    sinSeguimiento: Oportunidad[]
    altaProbInactiva: Oportunidad[]
  }
  embudo: EmbudoItem[]
}

// Borrador generado por la IA
export interface BorradorTarea { titulo: string; estimacionHoras: number }
export interface BorradorFase { nombre: string; tareas: BorradorTarea[] }
export interface BorradorRiesgo { texto: string; severidad: 'baja' | 'media' | 'alta' }
export interface Borrador {
  simulado: boolean
  proyecto: { nombre: string; descripcion: string; objetivos: string[] }
  fases: BorradorFase[]
  riesgos: BorradorRiesgo[]
  dependencias: string[]
  estimaciones: { totalHoras: number; notas: string }
}
