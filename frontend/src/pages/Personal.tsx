import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardMe } from '../api/hooks'
import { useAuth } from '../stores/auth'
import { useHeader } from '../lib/useHeader'
import { Card, Kpi, KpiBar, ActivityItem } from '../components/ui'
import { ProyectoRow, TareaRow, BloqueoCard } from '../components/rows'
import { NuevaTareaModal } from '../components/NuevaTareaModal'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/Brand'

export function Personal() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, isLoading } = useDashboardMe()
  const [tareaOpen, setTareaOpen] = useState(false)

  const hoy = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  useHeader({ title: 'Mi panel', sub: `${hoy} · ¿En qué estoy trabajando?` }, [])

  if (isLoading || !data) return <Cargando />

  const primerNombre = (user?.nombre ?? '').split(' ')[0]

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Hola, {primerNombre}</h2>
        <p className="text-sm text-zinc-400">Esto es lo que necesita tu atención hoy.</p>
      </div>

      <KpiBar>
        <Kpi icon="folder" label="Proyectos activos" value={data.kpis.proyectosActivos} sub={`de ${data.kpis.proyectosTotales}`} tone="blue" onClick={() => navigate('/departamento')} />
        <Kpi icon="checkbox" label="Tareas pendientes" value={data.kpis.tareasPendientes} sub={`${data.kpis.tareasVencidas} vencidas`} tone="violet" />
        <Kpi icon="alert" label="Bloqueos activos" value={data.kpis.bloqueosActivos} sub="requieren acción" tone={data.kpis.bloqueosActivos ? 'red' : 'emerald'} />
        <Kpi icon="trending" label="Progreso medio" value={`${data.kpis.progresoMedio}%`} sub="mis proyectos" tone="emerald" />
      </KpiBar>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card title="Mis proyectos" pad={false} action={<button onClick={() => navigate('/departamento')} className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Ver todos</button>}>
            <div className="px-2 py-1.5">
              <div className="grid grid-cols-12 gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span className="col-span-5">Proyecto</span><span className="col-span-2">Estado</span>
                <span className="col-span-3">Progreso</span><span className="col-span-1 text-center">Pend.</span><span className="col-span-1 text-right">Resp.</span>
              </div>
              {data.proyectos.map((p) => <ProyectoRow key={p.id} p={p} />)}
              {data.proyectos.length === 0 && <EmptyState titulo="Aún no participas en ningún proyecto" />}
            </div>
          </Card>

          <Card title="Mis tareas" pad={false} action={
            <button onClick={() => setTareaOpen(true)} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition"><Icon name="plus" className="w-3.5 h-3.5" />Tarea para mí</button>
          }>
            <div className="px-2 py-1.5">
              {data.tareas.map((t) => <TareaRow key={t.id} t={t} />)}
              {data.tareas.length === 0 && <EmptyState titulo="Sin tareas pendientes">Disfruta del café. ☕</EmptyState>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Mis bloqueos activos" action={data.bloqueos.length > 0 && <span className="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-500/15 px-1.5 rounded">{data.bloqueos.length}</span>}>
            <div className="space-y-2.5">
              {data.bloqueos.map((b) => <BloqueoCard key={b.id} b={b} />)}
              {data.bloqueos.length === 0 && <EmptyState titulo="Ningún bloqueo. Todo fluye." />}
            </div>
          </Card>

          <Card title="Actividad reciente" pad={false}>
            <ul className="px-4 py-1 divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.actividad.map((a) => <ActivityItem key={a.id} act={a} />)}
            </ul>
          </Card>
        </div>
      </div>

      {user && (
        <NuevaTareaModal
          open={tareaOpen}
          onClose={() => setTareaOpen(false)}
          asignadoFijo={{ id: user.id, nombre: user.nombre }}
          proyectos={data.proyectos.map((p) => ({ id: p.id, nombre: p.nombre }))}
        />
      )}
    </div>
  )
}

export function Cargando() {
  return <div className="p-10 text-center text-sm text-zinc-400">Cargando…</div>
}
