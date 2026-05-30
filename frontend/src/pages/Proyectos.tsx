import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProyectos, useCrearProyecto, useUsuarios } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { useAuth } from '../stores/auth'
import { esEncargado } from '../lib/permisos'
import { Card, Kpi } from '../components/ui'
import { ProyectoRow } from '../components/rows'
import { Modal, Field, fieldCls } from '../components/Modal'
import { Icon } from '../components/Icon'
import { cn } from '../lib/ui'
import { Cargando } from './Personal'

const PRIORIDADES: [string, string][] = [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta'], ['critica', 'Crítica']]

export function Proyectos() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const puedeGestionar = esEncargado(user)
  const [filtro, setFiltro] = useState('todos')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', cliente: '', descripcion: '', responsable: '' as number | '', prioridad: 'media', fechaInicio: '', fechaFinEstimada: '' })
  const { data: proyectos, isLoading } = useProyectos()
  const { data: usuarios = [] } = useUsuarios()
  const crearProyecto = useCrearProyecto()
  useHeader({ title: 'Proyectos', sub: 'Todos los proyectos del departamento' }, [])

  function crear() {
    if (!form.nombre.trim()) return
    crearProyecto.mutate({
      nombre: form.nombre, cliente: form.cliente || 'Interno', descripcion: form.descripcion || null,
      responsable: form.responsable || undefined, prioridad: form.prioridad,
      fechaInicio: form.fechaInicio || null, fechaFinEstimada: form.fechaFinEstimada || null,
    }, { onSuccess: (p) => { setOpen(false); navigate(`/proyecto/${p.id}`) } })
  }

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
      {puedeGestionar && (
        <div className="flex justify-end">
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition">
            <Icon name="plus" className="w-4 h-4" />Nuevo proyecto
          </button>
        </div>
      )}

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

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo proyecto"
        footer={<>
          <button onClick={() => setOpen(false)} className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
          <button onClick={crear} disabled={crearProyecto.isPending || !form.nombre.trim()} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50">Crear proyecto</button>
        </>}>
        <div className="space-y-4">
          <Field label="Nombre"><input className={fieldCls} autoFocus value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cliente"><input className={fieldCls} placeholder="Interno" value={form.cliente} onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))} /></Field>
            <Field label="Prioridad"><select className={fieldCls} value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value }))}>{PRIORIDADES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          </div>
          <Field label="Descripción"><textarea className={cn(fieldCls, 'h-auto py-2 resize-none')} rows={2} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} /></Field>
          <Field label="Responsable"><select className={fieldCls} value={form.responsable} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value ? Number(e.target.value) : '' }))}><option value="">Tú (por defecto)</option>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio"><input type="date" className={fieldCls} value={form.fechaInicio} onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))} /></Field>
            <Field label="Fin estimada"><input type="date" className={fieldCls} value={form.fechaFinEstimada} onChange={(e) => setForm((f) => ({ ...f, fechaFinEstimada: e.target.value }))} /></Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}
