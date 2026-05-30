import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardDepartment } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { Card, Kpi, KpiBar, ActivityItem, Progress } from '../components/ui'
import { ProyectoRow } from '../components/rows'
import { Icon } from '../components/Icon'
import { cn, TONES, cargaTone, barTone, type Tone } from '../lib/ui'
import { Cargando } from './Personal'
import type { ProyectoLite, MiembroEquipo } from '../types'

function RiesgoRow({ icon, tone, texto, detalle, meta, onClick }: { icon: string; tone: Tone; texto: string; detalle: string; meta: string; onClick: () => void }) {
  const t = TONES[tone]
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 h-14 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition text-left">
      <span className={cn('w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ring-1 ring-inset', t.soft)}><Icon name={icon} className="w-4 h-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{texto}</div>
        <div className="text-[11px] text-zinc-400 truncate">{detalle}</div>
      </div>
      <span className={cn('text-[11px] font-medium shrink-0', t.text)}>{meta}</span>
    </button>
  )
}

function EquipoCard({ m }: { m: MiembroEquipo }) {
  const navigate = useNavigate()
  const ct = cargaTone(m.carga)
  return (
    <button
      onClick={() => navigate(`/persona/${m.usuario.id}`)}
      className="group text-left rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition"
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{m.usuario.nombre}</div>
          <div className="text-[11px] text-zinc-400 truncate">{m.usuario.rolLabel}</div>
        </div>
        <span className={cn('font-mono text-sm font-semibold tabular-nums shrink-0', TONES[ct].text)}>{m.carga}%</span>
      </div>

      <Progress value={m.carga} tone={ct} />

      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        {m.proyectosActivos.length === 0 ? (
          <p className="text-[12px] text-zinc-400">Sin proyectos activos</p>
        ) : (
          <ul className="space-y-1.5">
            {m.proyectosActivos.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-[12px] text-zinc-600 dark:text-zinc-300">
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', TONES[barTone(p.estado)].dot)} />
                <span className="truncate">{p.nombre}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </button>
  )
}

export function Departamento() {
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('todos')
  const { data, isLoading } = useDashboardDepartment()
  useHeader({ title: 'Departamento', sub: 'Equipo, carga y estado operativo' }, [])

  if (isLoading || !data) return <Cargando />

  const { kpisEquipo, kpisProyectos, equipo, riesgos, proyectos, actividad } = data
  const totalSenales = riesgos.sinActividad.length + riesgos.conBloqueos.length + riesgos.conVencidas.length

  const filtros = [
    { id: 'todos', label: 'Todos', n: kpisProyectos.total },
    { id: 'progreso', label: 'Activos', n: kpisProyectos.activos },
    { id: 'bloqueado', label: 'Bloqueados', n: kpisProyectos.bloqueados },
    { id: 'retrasados', label: 'Retrasados', n: kpisProyectos.retrasados },
    { id: 'revision', label: 'En revisión', n: kpisProyectos.enRevision },
    { id: 'finalizado', label: 'Finalizados', n: kpisProyectos.finalizados },
  ]
  let lista: ProyectoLite[] = proyectos
  if (filtro === 'progreso') lista = proyectos.filter((p) => p.estado !== 'finalizado')
  else if (filtro === 'retrasados') lista = proyectos.filter((p) => p.retrasado)
  else if (filtro !== 'todos') lista = proyectos.filter((p) => p.estado === filtro)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* KPIs orientados al equipo */}
      <KpiBar>
        <Kpi icon="users" label="Personas en el equipo" value={kpisEquipo.personas} sub="activas" tone="blue" />
        <Kpi icon="trending" label="Saturados" value={kpisEquipo.saturados} sub="carga ≥ 90%" tone={kpisEquipo.saturados ? 'red' : 'emerald'} />
        <Kpi icon="alert" label="Tareas vencidas" value={kpisEquipo.tareasVencidas} sub="en el equipo" tone={kpisEquipo.tareasVencidas ? 'red' : 'emerald'} />
        <Kpi icon="blocked" label="Bloqueos activos" value={kpisEquipo.bloqueosActivos} sub="afectando al equipo" tone={kpisEquipo.bloqueosActivos ? 'amber' : 'emerald'} />
      </KpiBar>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Equipo: protagonista, en cards grandes */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Equipo</h3>
              <span className="text-xs text-zinc-400">{kpisEquipo.saturados} saturados · ordenado por carga</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {equipo.map((m) => <EquipoCard key={m.usuario.id} m={m} />)}
            </div>
          </div>

          {/* Proyectos: contexto secundario */}
          <Card title="Proyectos del departamento" pad={false} action={
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
              {lista.length === 0 && <p className="px-3 py-6 text-sm text-zinc-400 text-center">Ningún proyecto en este filtro.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Requiere atención" pad={false} action={<span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{totalSenales}</span>}>
            <div className="px-2 py-1.5 divide-y divide-zinc-100 dark:divide-zinc-800">
              {riesgos.conBloqueos.map((r) => (
                <RiesgoRow key={'bl' + r.proyecto.id} icon="blocked" tone="red" texto={r.proyecto.nombre}
                  detalle={`${r.bloqueos} bloqueo${r.bloqueos > 1 ? 's' : ''} · ${r.proyecto.cliente}`}
                  meta={`hace ${r.diasMax} d`} onClick={() => navigate(`/proyecto/${r.proyecto.id}`)} />
              ))}
              {riesgos.sinActividad.map((r) => (
                <RiesgoRow key={'sa' + r.proyecto.id} icon="clock" tone="amber" texto={r.proyecto.nombre}
                  detalle={`Sin actividad · ${r.proyecto.cliente}`} meta={`${r.dias} días`} onClick={() => navigate(`/proyecto/${r.proyecto.id}`)} />
              ))}
              {riesgos.conVencidas.map((r) => (
                <RiesgoRow key={'cv' + r.proyecto.id} icon="alert" tone="amber" texto={r.proyecto.nombre}
                  detalle={`${r.vencidas} tarea${r.vencidas > 1 ? 's' : ''} vencida${r.vencidas > 1 ? 's' : ''}`} meta="revisar" onClick={() => navigate(`/proyecto/${r.proyecto.id}`)} />
              ))}
              {totalSenales === 0 && <p className="px-3 py-6 text-sm text-zinc-400 text-center">Nada requiere atención. 🎉</p>}
            </div>
          </Card>

          <Card title="Actividad del departamento" pad={false}>
            <ul className="px-4 py-1 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[420px] overflow-y-auto">
              {actividad.map((a) => <ActivityItem key={a.id} act={a} />)}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
