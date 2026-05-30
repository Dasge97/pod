import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { Avatar, Progress, EstadoBadge, PrioridadBadge, OppBadge, Badge } from './ui'
import { EstadoTareaMenu } from './EstadoTareaMenu'
import { cn, barTone, type Tone } from '../lib/ui'
import { fmtFechaCorta, fmtEur } from '../lib/format'
import type { ProyectoLite, Tarea, Bloqueo, Oportunidad } from '../types'

/* ---------- Fila de proyecto ---------- */
export function ProyectoRow({ p }: { p: ProyectoLite }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/proyecto/${p.id}`)}
      className="group w-full grid grid-cols-12 items-center gap-3 px-3 h-14 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition text-left"
    >
      <div className="col-span-5 min-w-0 flex items-center gap-2.5">
        {p.retrasado && <span title="Retrasado" className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{p.nombre}</div>
          <div className="text-[11px] text-zinc-400 truncate">{p.cliente}</div>
        </div>
      </div>
      <div className="col-span-2"><EstadoBadge estado={p.estado} label={p.estadoLabel} /></div>
      <div className="col-span-3 flex items-center gap-2">
        <Progress value={p.progreso} tone={barTone(p.estado)} className="flex-1" />
        <span className="font-mono text-[11px] tabular-nums text-zinc-400 w-8 text-right">{p.progreso}%</span>
      </div>
      <div className="col-span-1 font-mono text-xs tabular-nums text-zinc-500 text-center">{p.tareasPend}</div>
      <div className="col-span-1 flex justify-end"><Avatar user={p.responsable} size="sm" /></div>
    </button>
  )
}

/* ---------- Fila de tarea ---------- */
export function TareaRow({ t, showProyecto = true }: { t: Tarea; showProyecto?: boolean }) {
  const navigate = useNavigate()
  const over = t.estimacionHoras != null && t.horasConsumidas > t.estimacionHoras
  return (
    <div
      onClick={() => t.proyecto && navigate(`/proyecto/${t.proyecto.id}`)}
      className="group w-full flex items-center gap-3 px-3 h-12 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition text-left cursor-pointer"
    >
      <span className="shrink-0"><PrioridadBadge prioridad={t.prioridad} label={t.prioridadLabel} /></span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{t.titulo}</div>
        {showProyecto && t.proyecto && <div className="text-[11px] text-zinc-400 truncate">{t.proyecto.nombre}</div>}
      </div>
      <span className="hidden lg:block"><EstadoTareaMenu tarea={t} /></span>
      <span className={cn('font-mono text-[11px] tabular-nums shrink-0 w-16 text-right', over ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400')}>
        {t.horasConsumidas}/{t.estimacionHoras ?? '—'} h
      </span>
      <span className={cn('flex items-center gap-1 shrink-0 w-20 justify-end text-[11px] font-medium', t.vencida ? 'text-red-600 dark:text-red-400' : 'text-zinc-400')}>
        <Icon name="clock" className="w-3 h-3" />
        {fmtFechaCorta(t.fechaLimite)}
      </span>
      <Avatar user={t.asignado} size="sm" />
    </div>
  )
}

/* ---------- Fila de oportunidad ---------- */
export function OppRow({ o }: { o: Oportunidad }) {
  const navigate = useNavigate()
  const probTone: Tone = o.probabilidad >= 70 ? 'emerald' : o.probabilidad >= 45 ? 'amber' : 'zinc'
  const alerta = (o.estado === 'sin_respuesta' && (o.diasEnvio ?? 0) > 14) || (o.probabilidad >= 70 && (o.diasSinSeguimiento ?? 0) > 10)
  const dEnvio = o.diasEnvio ?? 0
  return (
    <button onClick={() => navigate(`/oportunidad/${o.id}`)} className="group w-full grid grid-cols-12 items-center gap-3 px-3 h-14 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition text-left">
      <div className="col-span-4 min-w-0 flex items-center gap-2.5">
        {alerta && <span title="Requiere atención" className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{o.cliente}</div>
          <div className="text-[11px] text-zinc-400 truncate">{o.nombre}</div>
        </div>
      </div>
      <div className="col-span-2 font-mono text-[13px] font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{fmtEur(o.importe)}</div>
      <div className="col-span-2"><OppBadge estado={o.estado} label={o.estadoLabel} /></div>
      <div className="col-span-2 flex items-center gap-2">
        <Progress value={o.probabilidad} tone={probTone} className="flex-1" />
        <span className="font-mono text-[11px] tabular-nums text-zinc-400 w-8 text-right">{o.probabilidad}%</span>
      </div>
      <div className={cn('col-span-1 text-[11px] font-medium text-right', dEnvio > 21 ? 'text-red-600 dark:text-red-400' : dEnvio > 14 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400')}>{dEnvio} d</div>
      <div className="col-span-1 flex justify-end"><Avatar user={o.responsable} size="sm" /></div>
    </button>
  )
}

/* ---------- Tarjeta de bloqueo ---------- */
export function BloqueoCard({ b }: { b: Bloqueo }) {
  const navigate = useNavigate()
  const tone = b.severidad === 'critica' || b.severidad === 'alta' ? 'red' : 'amber'
  return (
    <button
      onClick={() => b.proyecto && navigate(`/proyecto/${b.proyecto.id}`)}
      className="w-full text-left rounded-lg border border-red-200/70 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/[0.07] p-3 hover:border-red-300 dark:hover:border-red-500/40 transition"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
          <Icon name="alert" className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge tone={tone} dot={false} className="capitalize">{b.severidadLabel}</Badge>
            <span className="text-[11px] text-zinc-400">hace {b.diasAbierto} d</span>
          </div>
          <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{b.titulo}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{b.proyecto?.nombre} · abierto por {b.creadoPor?.nombre}</p>
        </div>
      </div>
    </button>
  )
}
