import { Fragment, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOportunidad, useSeguimiento } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { useAuth } from '../stores/auth'
import { esComercial } from '../lib/permisos'
import { OportunidadModal } from '../components/OportunidadModal'
import { Card, OppBadge, Badge, Avatar } from '../components/ui'
import { Icon } from '../components/Icon'
import { cn, type Tone } from '../lib/ui'
import { fmtEur, fmtFechaCorta } from '../lib/format'
import { Cargando } from './Personal'
import type { ReactNode } from 'react'

function Stepper({ estado }: { estado: string }) {
  const pasos = [
    { id: 'borrador', label: 'Borrador' },
    { id: 'enviado', label: 'Enviado' },
    { id: 'negociacion', label: 'En negociación' },
    { id: 'aceptado', label: 'Aceptado' },
  ]
  const idx = pasos.findIndex((p) => p.id === estado)
  const rechazo = estado === 'rechazado' || estado === 'sin_respuesta'
  return (
    <div className="flex items-center">
      {pasos.map((p, i) => {
        const done = !rechazo && i < idx
        const current = !rechazo && i === idx
        return (
          <Fragment key={p.id}>
            <div className="flex flex-col items-center gap-1.5">
              <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ring-1',
                done ? 'bg-emerald-500 text-white ring-emerald-500'
                  : current ? 'bg-emerald-50 text-emerald-700 ring-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-zinc-100 text-zinc-400 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700')}>
                {done ? <Icon name="check" className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={cn('text-[11px] font-medium', current ? 'text-emerald-700 dark:text-emerald-300' : done ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-400')}>{p.label}</span>
            </div>
            {i < pasos.length - 1 && <div className={cn('flex-1 h-px mx-2 mb-5', i < idx && !rechazo ? 'bg-emerald-400' : 'bg-zinc-200 dark:bg-zinc-700')} />}
          </Fragment>
        )
      })}
    </div>
  )
}

function DatoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-[13px] text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{children}</span>
    </div>
  )
}

export function Oportunidad() {
  const { id } = useParams()
  const oid = Number(id)
  const navigate = useNavigate()
  const { data: o, isLoading } = useOportunidad(oid)
  const seguimiento = useSeguimiento()
  const { user } = useAuth()
  const puedeComercial = esComercial(user)
  const [editOpen, setEditOpen] = useState(false)

  useHeader({ crumbs: [{ label: 'Comercial', to: '/comercial' }, { label: o?.cliente ?? '…' }] }, [o?.cliente])

  if (isLoading || !o) return <Cargando />

  const probTone: Tone = o.probabilidad >= 70 ? 'emerald' : o.probabilidad >= 45 ? 'amber' : 'zinc'
  const alerta = (o.estado === 'sin_respuesta' && (o.diasEnvio ?? 0) > 14) || (o.probabilidad >= 70 && (o.diasSinSeguimiento ?? 0) > 10)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {alerta && (
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/[0.07] px-4 py-2.5">
          <Icon name="alert" className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-[13px] text-amber-800 dark:text-amber-200">
            {o.estado === 'sin_respuesta'
              ? `El cliente lleva ${o.diasEnvio} días sin responder al presupuesto.`
              : `Alta probabilidad (${o.probabilidad}%) sin seguimiento desde hace ${o.diasSinSeguimiento} días.`}
          </span>
          <button onClick={() => seguimiento.mutate({ id: o.id, nota: 'llamada de seguimiento' })} disabled={seguimiento.isPending}
            className="ml-auto h-7 px-2.5 rounded-md bg-amber-500 text-white text-[12px] font-medium hover:bg-amber-600 transition shrink-0 disabled:opacity-50">Registrar seguimiento</button>
        </div>
      )}

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <OppBadge estado={o.estado} label={o.estadoLabel} />
              <Badge tone={probTone} dot={false}>{o.probabilidad}% probabilidad</Badge>
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{o.nombre}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">{o.descripcion}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-zinc-400">Cliente</span>
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{o.cliente}</span>
              <span className="mx-1 text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Comercial</span>
              <Avatar user={o.responsable} size="sm" />
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{o.responsable?.nombre}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            {puedeComercial && (
              <button onClick={() => setEditOpen(true)} className="mb-2 h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1.5 ml-auto"><Icon name="edit" className="w-4 h-4" />Editar</button>
            )}
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Importe</div>
            <div className="font-mono text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{fmtEur(o.importe)}</div>
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <Stepper estado={o.estado} />
        </div>
      </Card>

      {/* CTA IA */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/25 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/[0.08] dark:to-zinc-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0"><Icon name="sparkles" className="w-5 h-5" /></span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">Generar proyecto con IA</h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">Convierte este presupuesto en un proyecto: fases, tareas iniciales, riesgos y estimaciones. Siempre revisas el borrador antes de crearlo.</p>
          </div>
          <button onClick={() => navigate(`/asistente?oportunidad=${o.id}`)}
            className="shrink-0 h-10 px-4 rounded-lg bg-emerald-500 text-white text-[14px] font-medium hover:bg-emerald-600 transition flex items-center justify-center gap-2">
            <Icon name="sparkles" className="w-4 h-4" />Generar borrador
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card title="Datos del presupuesto" pad={false}>
            <DatoRow label="Cliente">{o.cliente}</DatoRow>
            <DatoRow label="Importe">{fmtEur(o.importe)}</DatoRow>
            <DatoRow label="Responsable comercial">{o.responsable?.nombre}</DatoRow>
            <DatoRow label="Estado"><OppBadge estado={o.estado} label={o.estadoLabel} /></DatoRow>
            <DatoRow label="Probabilidad de cierre">{o.probabilidad}%</DatoRow>
            <DatoRow label="Fecha de envío">{fmtFechaCorta(o.fechaEnvio)} · hace {o.diasEnvio} días</DatoRow>
            <DatoRow label="Último seguimiento">hace {o.diasSinSeguimiento ?? '—'} días</DatoRow>
          </Card>
        </div>
        <div className="space-y-5">
          <Card title="Estado del proyecto">
            {o.proyectoGeneradoId ? (
              <button onClick={() => navigate(`/proyecto/${o.proyectoGeneradoId}`)} className="w-full flex items-center gap-2 text-[13px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                <Icon name="folder" className="w-4 h-4" />Ver proyecto generado
              </button>
            ) : (
              <p className="text-[13px] text-zinc-400">Aún no se ha generado ningún proyecto a partir de este presupuesto.</p>
            )}
          </Card>
        </div>
      </div>

      <OportunidadModal open={editOpen} onClose={() => setEditOpen(false)} oportunidad={o} />
    </div>
  )
}
