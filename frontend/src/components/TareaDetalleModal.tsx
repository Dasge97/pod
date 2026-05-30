import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTarea, useTareaActividad, useUpdateTarea, useEliminarTarea, useComentarTarea, useUsuarios } from '../api/hooks'
import { useTareaModal } from '../stores/tareaModal'
import { useAuth } from '../stores/auth'
import { esEncargado } from '../lib/permisos'
import { Modal, Field, fieldCls } from './Modal'
import { Icon } from './Icon'
import { cn, TONES, ACT_TONE, ACT_ICON } from '../lib/ui'
import { hace, fmtFechaCorta } from '../lib/format'
import type { Tarea } from '../types'

const ESTADOS: [string, string][] = [['pendiente', 'Pendiente'], ['progreso', 'En progreso'], ['bloqueada', 'Bloqueada'], ['finalizada', 'Finalizada']]
const PRIORIDADES: [string, string][] = [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta'], ['critica', 'Crítica']]

export function TareaDetalleModal() {
  const { tareaId, cerrar } = useTareaModal()
  const navigate = useNavigate()
  const { user } = useAuth()
  const puedeGestionar = esEncargado(user)

  const { data: tarea } = useTarea(tareaId ?? 0)
  const { data: actividad = [] } = useTareaActividad(tareaId ?? 0)
  const { data: usuarios = [] } = useUsuarios()
  const update = useUpdateTarea()
  const eliminar = useEliminarTarea()
  const comentar = useComentarTarea()

  const [form, setForm] = useState({ titulo: '', estado: 'pendiente', prioridad: 'media', asignado: '' as number | '', estimacionHoras: '' as number | '', horasConsumidas: 0, fechaLimite: '' })
  const [comentario, setComentario] = useState('')

  useEffect(() => {
    if (tarea) {
      setForm({
        titulo: tarea.titulo, estado: tarea.estado, prioridad: tarea.prioridad,
        asignado: tarea.asignado?.id ?? '', estimacionHoras: tarea.estimacionHoras ?? '',
        horasConsumidas: tarea.horasConsumidas, fechaLimite: tarea.fechaLimite ?? '',
      })
      setComentario('')
    }
  }, [tarea?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!tareaId || !tarea) return null

  const esAsignado = tarea.asignado?.id === user?.id
  const puedeEliminar = puedeGestionar || esAsignado
  const completada = tarea.estado === 'finalizada'

  function guardar() {
    update.mutate({ id: tarea!.id, cambios: {
      titulo: form.titulo, estado: form.estado as Tarea['estado'], prioridad: form.prioridad as Tarea['prioridad'],
      asignado: form.asignado === '' ? null : Number(form.asignado),
      estimacionHoras: form.estimacionHoras === '' ? null : Number(form.estimacionHoras),
      horasConsumidas: Number(form.horasConsumidas),
      fechaLimite: form.fechaLimite || null,
    } }, { onSuccess: () => cerrar() })
  }

  function completar() {
    update.mutate({ id: tarea!.id, cambios: { estado: (completada ? 'progreso' : 'finalizada') as Tarea['estado'] } })
  }

  function borrar() {
    if (!confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.')) return
    eliminar.mutate({ id: tarea!.id, proyectoId: tarea!.proyecto?.id }, { onSuccess: () => cerrar() })
  }

  function enviarComentario() {
    if (!comentario.trim()) return
    comentar.mutate({ tareaId: tarea!.id, texto: comentario.trim() }, { onSuccess: () => setComentario('') })
  }

  return (
    <Modal open onClose={cerrar} title="Detalle de tarea"
      footer={<>
        {puedeEliminar && <button onClick={borrar} className="h-9 px-3 mr-auto rounded-lg border border-red-200 dark:border-red-500/30 text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition">Eliminar</button>}
        <button onClick={cerrar} className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cerrar</button>
        <button onClick={guardar} disabled={update.isPending} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50">Guardar</button>
      </>}>
      <div className="space-y-4">
        {/* Completar + proyecto */}
        <div className="flex items-center gap-2">
          <button onClick={completar} className={cn('flex items-center gap-2 h-8 px-3 rounded-lg text-[13px] font-medium transition', completada ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-emerald-500 text-white hover:bg-emerald-600')}>
            <Icon name={completada ? 'check' : 'checkbox'} className="w-4 h-4" />{completada ? 'Completada' : 'Marcar completada'}
          </button>
          {tarea.proyecto && <button onClick={() => { cerrar(); navigate(`/proyecto/${tarea.proyecto!.id}`) }} className="ml-auto text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"><Icon name="folder" className="w-3.5 h-3.5" />{tarea.proyecto.nombre}</button>}
        </div>
        {completada && tarea.fechaFinalizacion && <p className="text-[12px] text-zinc-400">Completada el {fmtFechaCorta(tarea.fechaFinalizacion)}.</p>}

        <Field label="Título"><input className={fieldCls} value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estado"><select className={fieldCls} value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}>{ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label="Prioridad"><select className={fieldCls} value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value }))}>{PRIORIDADES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Asignado">
            {puedeGestionar ? (
              <select className={fieldCls} value={form.asignado} onChange={(e) => setForm((f) => ({ ...f, asignado: e.target.value ? Number(e.target.value) : '' }))}>
                <option value="">Sin asignar</option>
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            ) : (
              <div className="h-9 px-3 flex items-center rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-[13px] text-zinc-700 dark:text-zinc-200">{tarea.asignado?.nombre ?? 'Sin asignar'}</div>
            )}
          </Field>
          <Field label="Fecha límite"><input type="date" className={fieldCls} value={form.fechaLimite} onChange={(e) => setForm((f) => ({ ...f, fechaLimite: e.target.value }))} /></Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estimación (h)"><input type="number" min={0} className={fieldCls} value={form.estimacionHoras} onChange={(e) => setForm((f) => ({ ...f, estimacionHoras: e.target.value === '' ? '' : Number(e.target.value) }))} /></Field>
          <Field label="Consumidas (h)"><input type="number" min={0} className={fieldCls} value={form.horasConsumidas} onChange={(e) => setForm((f) => ({ ...f, horasConsumidas: Number(e.target.value) }))} /></Field>
        </div>

        {/* Historial + comentarios */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Historial y comentarios</div>
          <div className="flex gap-2 mb-3">
            <input value={comentario} onChange={(e) => setComentario(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enviarComentario() }} placeholder="Escribe un comentario…" className={fieldCls} />
            <button onClick={enviarComentario} disabled={!comentario.trim() || comentar.isPending} className="h-9 px-3 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50 shrink-0">Enviar</button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {actividad.map((a) => {
              const tone = ACT_TONE[a.familia] || 'zinc'
              return (
                <li key={a.id} className="flex gap-2.5">
                  <span className={cn('mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center ring-1 ring-inset', TONES[tone].soft)}><Icon name={ACT_ICON[a.familia] || 'dot'} className="w-3 h-3" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] leading-snug text-zinc-600 dark:text-zinc-300"><span className="font-medium text-zinc-900 dark:text-zinc-100">{a.usuario?.nombre}</span> {a.texto} {a.objeto}</p>
                    <span className="text-[11px] text-zinc-400">{hace(a.fecha)}</span>
                  </div>
                </li>
              )
            })}
            {actividad.length === 0 && <li className="text-[12px] text-zinc-400 text-center py-2">Sin actividad todavía.</li>}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
