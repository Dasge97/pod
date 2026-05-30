import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Tone = 'zinc' | 'blue' | 'amber' | 'red' | 'violet' | 'emerald'

/** Paleta de tonos (claro + oscuro), portada del diseño de POD. */
export const TONES: Record<Tone, { dot: string; soft: string; bar: string; text: string }> = {
  zinc: { dot: 'bg-zinc-400', soft: 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700', bar: 'bg-zinc-400', text: 'text-zinc-500 dark:text-zinc-400' },
  blue: { dot: 'bg-blue-500', soft: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/25', bar: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-300' },
  amber: { dot: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-300' },
  red: { dot: 'bg-red-500', soft: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/25', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-300' },
  violet: { dot: 'bg-violet-500', soft: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/25', bar: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-300' },
  emerald: { dot: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25', bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-300' },
}

export const PROYECTO_ESTADO_TONE: Record<string, Tone> = {
  pendiente: 'zinc', progreso: 'blue', bloqueado: 'red', revision: 'violet', finalizado: 'emerald',
}
export const TAREA_ESTADO_TONE: Record<string, Tone> = {
  pendiente: 'zinc', progreso: 'blue', bloqueada: 'red', finalizada: 'emerald',
}
export const PRIORIDAD_TONE: Record<string, Tone> = {
  baja: 'zinc', media: 'blue', alta: 'amber', critica: 'red',
}
export const OPP_ESTADO_TONE: Record<string, Tone> = {
  borrador: 'zinc', enviado: 'blue', negociacion: 'violet', aceptado: 'emerald', rechazado: 'zinc', sin_respuesta: 'amber',
}
export const ROL_PART_TONE: Record<string, Tone> = {
  responsable: 'emerald', colaborador: 'blue', consultado: 'zinc',
}

export const ACT_ICON: Record<string, string> = {
  tarea: 'checkbox', bloqueo: 'alert', estado: 'flag', comentario: 'doc', proyecto: 'folder', oportunidad: 'trending',
}
export const ACT_TONE: Record<string, Tone> = {
  tarea: 'blue', bloqueo: 'red', estado: 'violet', comentario: 'zinc', proyecto: 'emerald', oportunidad: 'amber',
}

/** Tono de barra de progreso de un proyecto según su estado. */
export function barTone(estado: string): Tone {
  return estado === 'bloqueado' ? 'red' : estado === 'finalizado' ? 'emerald' : estado === 'revision' ? 'violet' : 'blue'
}

/** Tono del indicador de carga de trabajo. */
export function cargaTone(value: number): Tone {
  return value >= 90 ? 'red' : value >= 75 ? 'amber' : 'emerald'
}
