import { useState, useEffect } from 'react'
import { useCrearOportunidad, useUpdateOportunidad, useUsuarios } from '../api/hooks'
import { Modal, Field, fieldCls } from './Modal'
import { cn } from '../lib/ui'
import type { Oportunidad } from '../types'

const ESTADOS: [string, string][] = [
  ['borrador', 'Borrador'], ['enviado', 'Enviado'], ['negociacion', 'En negociación'],
  ['aceptado', 'Aceptado'], ['rechazado', 'Rechazado'], ['sin_respuesta', 'Sin respuesta'],
]

export function OportunidadModal({ open, onClose, oportunidad }: { open: boolean; onClose: () => void; oportunidad?: Oportunidad }) {
  const crear = useCrearOportunidad()
  const actualizar = useUpdateOportunidad()
  const { data: usuarios = [] } = useUsuarios()
  const [form, setForm] = useState({ cliente: '', nombre: '', descripcion: '', importe: '' as number | '', probabilidad: 50, estado: 'borrador', responsable: '' as number | '', fechaEnvio: '' })

  useEffect(() => {
    if (open) {
      setForm(oportunidad ? {
        cliente: oportunidad.cliente, nombre: oportunidad.nombre, descripcion: oportunidad.descripcion ?? '',
        importe: oportunidad.importe, probabilidad: oportunidad.probabilidad, estado: oportunidad.estado,
        responsable: oportunidad.responsable?.id ?? '', fechaEnvio: oportunidad.fechaEnvio ?? '',
      } : { cliente: '', nombre: '', descripcion: '', importe: '', probabilidad: 50, estado: 'borrador', responsable: '', fechaEnvio: '' })
    }
  }, [open, oportunidad])

  function guardar() {
    if (!form.cliente.trim() || !form.nombre.trim()) return
    const datos: Record<string, unknown> = {
      cliente: form.cliente, nombre: form.nombre, descripcion: form.descripcion || null,
      importe: form.importe === '' ? 0 : Number(form.importe), probabilidad: Number(form.probabilidad),
      estado: form.estado, responsable: form.responsable || undefined, fechaEnvio: form.fechaEnvio || null,
    }
    if (oportunidad) actualizar.mutate({ id: oportunidad.id, cambios: datos }, { onSuccess: () => onClose() })
    else crear.mutate(datos, { onSuccess: () => onClose() })
  }

  return (
    <Modal open={open} onClose={onClose} title={oportunidad ? 'Editar oportunidad' : 'Nueva oportunidad'}
      footer={<>
        <button onClick={onClose} className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
        <button onClick={guardar} disabled={crear.isPending || actualizar.isPending || !form.cliente.trim() || !form.nombre.trim()} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50">Guardar</button>
      </>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cliente"><input className={fieldCls} autoFocus value={form.cliente} onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))} /></Field>
          <Field label="Importe (€)"><input type="number" min={0} className={fieldCls} value={form.importe} onChange={(e) => setForm((f) => ({ ...f, importe: e.target.value === '' ? '' : Number(e.target.value) }))} /></Field>
        </div>
        <Field label="Título de la oportunidad"><input className={fieldCls} value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} /></Field>
        <Field label="Descripción"><textarea className={cn(fieldCls, 'h-auto py-2 resize-none')} rows={2} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Estado"><select className={fieldCls} value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}>{ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label="Responsable"><select className={fieldCls} value={form.responsable} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value ? Number(e.target.value) : '' }))}><option value="">Tú (por defecto)</option>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Probabilidad (${form.probabilidad}%)`}><input type="range" min={0} max={100} className="w-full accent-emerald-500" value={form.probabilidad} onChange={(e) => setForm((f) => ({ ...f, probabilidad: Number(e.target.value) }))} /></Field>
          <Field label="Fecha de envío"><input type="date" className={fieldCls} value={form.fechaEnvio} onChange={(e) => setForm((f) => ({ ...f, fechaEnvio: e.target.value }))} /></Field>
        </div>
      </div>
    </Modal>
  )
}
