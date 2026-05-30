import { useState } from 'react'
import { useProyectos } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { Card, Kpi } from '../components/ui'
import { ProyectoRow } from '../components/rows'
import { cn } from '../lib/ui'
import { Cargando } from './Personal'

export function Proyectos() {
  const [filtro, setFiltro] = useState('todos')
  const { data: proyectos, isLoading } = useProyectos()
  useHeader({ title: 'Proyectos', sub: 'Todos los proyectos del departamento' }, [])

  if (isLoading || !proyectos) return <Cargando />

  const conteo = {
    total: proyectos.length,
    activos: proyectos.filter((p) => p.estado !== 'finalizado').length,
    bloqueados: proyectos.filter((p) => p.estado === 'bloqueado').length,
    retrasados: proyectos.filter((p) => p.retrasado).length,
    revision: proyectos.filter((p) => p.estado === 'revision').length,
    finalizados: proyectos.filter((p) => p.estado === 'finalizado').length,
  }

  const filtros = [
    { id: 'todos', label: 'Todos', n: conteo.total },
    { id: 'progreso', label: 'Activos', n: conteo.activos },
    { id: 'bloqueado', label: 'Bloqueados', n: conteo.bloqueados },
    { id: 'retrasados', label: 'Retrasados', n: conteo.retrasados },
    { id: 'revision', label: 'En revisión', n: conteo.revision },
    { id: 'finalizado', label: 'Finalizados', n: conteo.finalizados },
  ]
  let lista = proyectos
  if (filtro === 'progreso') lista = proyectos.filter((p) => p.estado !== 'finalizado')
  else if (filtro === 'retrasados') lista = proyectos.filter((p) => p.retrasado)
  else if (filtro !== 'todos') lista = proyectos.filter((p) => p.estado === filtro)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi icon="folder" label="Activos" value={conteo.activos} sub={`de ${conteo.total}`} tone="blue" onClick={() => setFiltro('progreso')} />
        <Kpi icon="blocked" label="Bloqueados" value={conteo.bloqueados} sub="ahora" tone="red" onClick={() => setFiltro('bloqueado')} />
        <Kpi icon="clock" label="Retrasados" value={conteo.retrasados} sub="sobre plan" tone="amber" onClick={() => setFiltro('retrasados')} />
        <Kpi icon="flag" label="En revisión" value={conteo.revision} sub="por cerrar" tone="violet" onClick={() => setFiltro('revision')} />
        <Kpi icon="check" label="Finalizados" value={conteo.finalizados} sub="cerrados" tone="emerald" onClick={() => setFiltro('finalizado')} />
        <Kpi icon="layers" label="Total" value={conteo.total} sub="proyectos" tone="zinc" onClick={() => setFiltro('todos')} />
      </div>

      <Card title="Proyectos" pad={false} action={
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {filtros.map((f) => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={cn('px-2 h-7 rounded-md text-xs font-medium transition flex items-center gap-1.5', filtro === f.id ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800')}>
              {f.label}<span className={cn('font-mono', filtro === f.id ? 'opacity-70' : 'text-zinc-400')}>{f.n}</span>
            </button>
          ))}
        </div>
      }>
        <div className="px-2 py-1.5">
          <div className="grid grid-cols-12 gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <span className="col-span-5">Proyecto</span><span className="col-span-2">Estado</span>
            <span className="col-span-3">Progreso</span><span className="col-span-1 text-center">Pend.</span><span className="col-span-1 text-right">Resp.</span>
          </div>
          {lista.map((p) => <ProyectoRow key={p.id} p={p} />)}
          {lista.length === 0 && <p className="px-3 py-10 text-sm text-zinc-400 text-center">No hay proyectos en este filtro.</p>}
        </div>
      </Card>
    </div>
  )
}
