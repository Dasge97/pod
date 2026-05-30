import { useParams } from 'react-router-dom'
import { usePersonaOverview } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { Card, Kpi, Avatar, Progress, Badge } from '../components/ui'
import { ProyectoRow, TareaRow, BloqueoCard } from '../components/rows'
import { cn, TONES, cargaTone, type Tone } from '../lib/ui'
import { Cargando } from './Personal'
import type { EstadoCarga } from '../types'

const ESTADO_CARGA: Record<EstadoCarga, { label: string; tone: Tone }> = {
  saturado: { label: 'Saturado', tone: 'red' },
  ok: { label: 'En carga', tone: 'amber' },
  holgura: { label: 'Con holgura', tone: 'emerald' },
}

export function Persona() {
  const { id } = useParams()
  const uid = Number(id)
  const { data, isLoading } = usePersonaOverview(uid)

  useHeader({ crumbs: [{ label: 'Departamento', to: '/departamento' }, { label: data?.usuario.nombre ?? '…' }] }, [data?.usuario.nombre])

  if (isLoading || !data) return <Cargando />

  const { usuario, kpis, proyectos, tareas, bloqueos } = data
  const ct = cargaTone(kpis.carga)
  const estado = ESTADO_CARGA[kpis.estado]
  const lidera = proyectos.filter((p) => p.esResponsable)
  const participa = proyectos.filter((p) => !p.esResponsable)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Cabecera de la persona */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar user={usuario} size="lg" />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{usuario.nombre}</h2>
              <p className="text-sm text-zinc-400">{usuario.rolLabel} · {usuario.email}</p>
            </div>
          </div>
          <div className="w-full sm:w-64 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Carga de trabajo</span>
              <Badge tone={estado.tone} dot>{estado.label}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={kpis.carga} tone={ct} className="flex-1" />
              <span className={cn('font-mono text-sm font-semibold tabular-nums', TONES[ct].text)}>{kpis.carga}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs de la persona */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon="folder" label="Proyectos" value={kpis.proyectos} sub={kpis.proyectosLidera > 0 ? `lidera ${kpis.proyectosLidera}` : 'participa'} tone="blue" />
        <Kpi icon="checkbox" label="Tareas abiertas" value={kpis.tareasAbiertas} sub="asignadas" tone="violet" />
        <Kpi icon="alert" label="Tareas vencidas" value={kpis.tareasVencidas} sub="requieren acción" tone={kpis.tareasVencidas ? 'red' : 'emerald'} />
        <Kpi icon="blocked" label="Bloqueos" value={kpis.bloqueos} sub="le afectan" tone={kpis.bloqueos ? 'amber' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card title="Proyectos que lleva" pad={false}>
            <div className="px-2 py-1.5">
              {lidera.length > 0 && (
                <>
                  <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Como responsable</div>
                  {lidera.map((p) => <ProyectoRow key={p.id} p={p} />)}
                </>
              )}
              {participa.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Participa</div>
                  {participa.map((p) => <ProyectoRow key={p.id} p={p} />)}
                </>
              )}
              {proyectos.length === 0 && <p className="px-3 py-6 text-sm text-zinc-400 text-center">No participa en ningún proyecto.</p>}
            </div>
          </Card>

          <Card title="Sus tareas" pad={false} action={<span className="text-xs text-zinc-400">por prioridad</span>}>
            <div className="px-2 py-1.5">
              {tareas.map((t) => <TareaRow key={t.id} t={t} />)}
              {tareas.length === 0 && <p className="px-3 py-6 text-sm text-zinc-400 text-center">Sin tareas abiertas.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Bloqueos que le afectan" action={bloqueos.length > 0 && <span className="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-500/15 px-1.5 rounded">{bloqueos.length}</span>}>
            <div className="space-y-2.5">
              {bloqueos.map((b) => <BloqueoCard key={b.id} b={b} />)}
              {bloqueos.length === 0 && <p className="py-4 text-sm text-zinc-400 text-center">Ningún bloqueo. Todo fluye.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
