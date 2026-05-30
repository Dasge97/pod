import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { usePersonaOverview, useProyectos } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { useAuth } from '../stores/auth'
import { esEncargado } from '../lib/permisos'
import { Card, Kpi, Avatar, Progress, Badge, EstadoBadge } from '../components/ui'
import { TareaRow, BloqueoCard } from '../components/rows'
import { NuevaTareaModal } from '../components/NuevaTareaModal'
import { Icon } from '../components/Icon'
import { cn, TONES, cargaTone, barTone, type Tone } from '../lib/ui'
import { Cargando } from './Personal'
import type { EstadoCarga, ProyectoLite, Tarea } from '../types'

const ESTADO_CARGA: Record<EstadoCarga, { label: string; tone: Tone }> = {
  saturado: { label: 'Saturado', tone: 'red' },
  ok: { label: 'En carga', tone: 'amber' },
  holgura: { label: 'Con holgura', tone: 'emerald' },
}

/** Un proyecto con las tareas de la persona anidadas visualmente debajo. */
function ProyectoConTareas({ p, tareas }: { p: ProyectoLite & { esResponsable: boolean }; tareas: Tarea[] }) {
  const navigate = useNavigate()
  return (
    <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 h-12 bg-zinc-50/60 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
        <span className={cn('w-2 h-2 rounded-full shrink-0', TONES[barTone(p.estado)].dot)} />
        <button onClick={() => navigate(`/proyecto/${p.id}`)} className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 truncate">{p.nombre}</button>
        <EstadoBadge estado={p.estado} label={p.estadoLabel} />
        {p.esResponsable && <Badge tone="emerald" dot={false}>Responsable</Badge>}
        <span className="ml-auto text-[11px] text-zinc-400 font-mono shrink-0">{tareas.length} tarea{tareas.length !== 1 ? 's' : ''}</span>
      </div>

      {tareas.length > 0 ? (
        <div className="py-1.5 pr-2">
          <div className="ml-5 border-l-2 border-zinc-150 dark:border-zinc-800 pl-1">
            {tareas.map((t) => <TareaRow key={t.id} t={t} showProyecto={false} />)}
          </div>
        </div>
      ) : (
        <p className="px-4 py-3 text-[12px] text-zinc-400">Sin tareas asignadas a esta persona en el proyecto.</p>
      )}
    </div>
  )
}

export function Persona() {
  const { id } = useParams()
  const uid = Number(id)
  const { data, isLoading } = usePersonaOverview(uid)
  const { data: todosProyectos = [] } = useProyectos()
  const { user } = useAuth()
  const puedeAsignar = esEncargado(user) || user?.id === uid
  const qc = useQueryClient()
  const [asignarOpen, setAsignarOpen] = useState(false)

  useHeader({ crumbs: [{ label: 'Departamento', to: '/departamento' }, { label: data?.usuario.nombre ?? '…' }] }, [data?.usuario.nombre])

  if (isLoading || !data) return <Cargando />

  const { usuario, kpis, proyectos, tareas, bloqueos } = data
  const ct = cargaTone(kpis.carga)
  const estado = ESTADO_CARGA[kpis.estado]

  const tareasDe = (pid: number) => tareas.filter((t) => t.proyecto?.id === pid)
  // Proyectos con más tareas de la persona primero, para dar protagonismo a su trabajo.
  const ordenados = [...proyectos].sort((a, b) => tareasDe(b.id).length - tareasDe(a.id).length)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Cabecera */}
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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon="folder" label="Proyectos" value={kpis.proyectos} sub={kpis.proyectosLidera > 0 ? `lidera ${kpis.proyectosLidera}` : 'participa'} tone="blue" />
        <Kpi icon="checkbox" label="Tareas abiertas" value={kpis.tareasAbiertas} sub="asignadas" tone="violet" />
        <Kpi icon="alert" label="Tareas vencidas" value={kpis.tareasVencidas} sub="requieren acción" tone={kpis.tareasVencidas ? 'red' : 'emerald'} />
        <Kpi icon="blocked" label="Bloqueos" value={kpis.bloqueos} sub="le afectan" tone={kpis.bloqueos ? 'amber' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Protagonista: trabajo de la persona, tareas anidadas por proyecto */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Su trabajo</h3>
            {puedeAsignar ? (
              <button onClick={() => setAsignarOpen(true)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500 text-white text-[12px] font-medium hover:bg-emerald-600 transition">
                <Icon name="plus" className="w-3.5 h-3.5" />{user?.id === uid ? 'Nueva tarea' : 'Asignar tarea'}
              </button>
            ) : (
              <span className="text-xs text-zinc-400">{kpis.tareasAbiertas} tareas en {proyectos.length} proyectos</span>
            )}
          </div>
          {ordenados.map((p) => <ProyectoConTareas key={p.id} p={p} tareas={tareasDe(p.id)} />)}
          {proyectos.length === 0 && (
            <Card><p className="py-6 text-sm text-zinc-400 text-center">No participa en ningún proyecto.</p></Card>
          )}
        </div>

        {/* Lateral: bloqueos */}
        <div className="space-y-5">
          <Card title="Bloqueos que le afectan" action={bloqueos.length > 0 && <span className="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-500/15 px-1.5 rounded">{bloqueos.length}</span>}>
            <div className="space-y-2.5">
              {bloqueos.map((b) => <BloqueoCard key={b.id} b={b} />)}
              {bloqueos.length === 0 && <p className="py-4 text-sm text-zinc-400 text-center">Ningún bloqueo. Todo fluye.</p>}
            </div>
          </Card>
        </div>
      </div>

      <NuevaTareaModal
        open={asignarOpen}
        onClose={() => setAsignarOpen(false)}
        asignadoFijo={{ id: usuario.id, nombre: usuario.nombre }}
        proyectos={todosProyectos.map((p) => ({ id: p.id, nombre: p.nombre }))}
        onCreated={() => qc.invalidateQueries({ queryKey: ['persona', uid] })}
      />
    </div>
  )
}
