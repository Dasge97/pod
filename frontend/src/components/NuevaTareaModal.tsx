import { useState, useEffect } from 'react'
import { useCrearTarea } from '../api/hooks'
import { Modal, Field, fieldCls } from './Modal'
import { Icon } from './Icon'
import { cn } from '../lib/ui'
import type { Usuario } from '../types'

const PRIORIDADES: [string, string][] = [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta'], ['critica', 'Crítica']]

interface RefItem { id: number; nombre: string }

interface Props {
  open: boolean
  onClose: () => void
  /** Si se fija, no se muestra selector de proyecto. */
  proyectoFijo?: RefItem
  /** Lista de proyectos para el selector (si no hay proyectoFijo). */
  proyectos?: RefItem[]
  /** Si se fija, la tarea se asigna a esta persona (sin selector). */
  asignadoFijo?: RefItem
  /** Lista de usuarios para el selector de asignado (si no hay asignadoFijo). */
  usuarios?: Usuario[]
  /** IDs de participantes del proyecto, para avisar de asignaciones externas. */
  participantesIds?: number[]
  onCreated?: () => void
}

export function NuevaTareaModal({ open, onClose, proyectoFijo, proyectos = [], asignadoFijo, usuarios = [], participantesIds, onCreated }: Props) {
  const crear = useCrearTarea()
  const [titulo, setTitulo] = useState('')
  const [proyecto, setProyecto] = useState<number | ''>('')
  const [asignado, setAsignado] = useState<number | ''>('')
  const [prioridad, setPrioridad] = useState('media')
  const [estimacion, setEstimacion] = useState<number | ''>('')
  const [fechaLimite, setFechaLimite] = useState('')

  // Reinicia el formulario al abrir, fijando lo que corresponda.
  useEffect(() => {
    if (open) {
      setTitulo(''); setPrioridad('media'); setEstimacion(''); setFechaLimite('')
      setProyecto(proyectoFijo?.id ?? (proyectos[0]?.id ?? ''))
      setAsignado(asignadoFijo?.id ?? '')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const proyectoId = proyectoFijo?.id ?? (proyecto === '' ? null : Number(proyecto))
  const asignadoId = asignadoFijo?.id ?? (asignado === '' ? null : Number(asignado))
  const esExterno = participantesIds != null && asignadoId != null && !participantesIds.includes(asignadoId)

  function guardar() {
    if (!titulo.trim() || !proyectoId) return
    crear.mutate({
      proyecto: proyectoId, titulo, prioridad,
      asignado: asignadoId,
      estimacionHoras: estimacion === '' ? null : Number(estimacion),
      fechaLimite: fechaLimite || null,
    }, { onSuccess: () => { onClose(); onCreated?.() } })
  }

  return (
    <Modal open={open} onClose={onClose} title={asignadoFijo ? `Asignar tarea a ${asignadoFijo.nombre}` : 'Nueva tarea'}
      footer={<>
        <button onClick={onClose} className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
        <button onClick={guardar} disabled={crear.isPending || !titulo.trim() || !proyectoId} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50">Crear tarea</button>
      </>}>
      <div className="space-y-4">
        <Field label="Título"><input className={fieldCls} autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} /></Field>

        {!proyectoFijo && (
          <Field label="Proyecto">
            <select className={fieldCls} value={proyecto} onChange={(e) => setProyecto(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Selecciona proyecto…</option>
              {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </Field>
        )}
        {proyectoFijo && (
          <Field label="Proyecto"><div className="h-9 px-3 flex items-center rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-[13px] text-zinc-700 dark:text-zinc-200">{proyectoFijo.nombre}</div></Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          {!asignadoFijo ? (
            <Field label="Asignado">
              <select className={fieldCls} value={asignado} onChange={(e) => setAsignado(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Sin asignar</option>
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Asignado"><div className="h-9 px-3 flex items-center rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-[13px] text-zinc-700 dark:text-zinc-200">{asignadoFijo.nombre}</div></Field>
          )}
          <Field label="Prioridad"><select className={fieldCls} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>{PRIORIDADES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        </div>

        {esExterno && (
          <p className="text-[12px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5"><Icon name="alert" className="w-3.5 h-3.5 shrink-0" />Esta persona no participa en el proyecto. Se añadirá como colaborador.</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estimación (horas)"><input type="number" min={0} className={fieldCls} value={estimacion} onChange={(e) => setEstimacion(e.target.value === '' ? '' : Number(e.target.value))} /></Field>
          <Field label="Fecha límite"><input type="date" className={cn(fieldCls)} value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  )
}
