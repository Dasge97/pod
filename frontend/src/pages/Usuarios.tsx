import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useUsuariosTodos, useCrearUsuario, useUpdateUsuario } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { useAuth } from '../stores/auth'
import { esAdmin, ROLES_USUARIO } from '../lib/permisos'
import { Card, Avatar, Badge } from '../components/ui'
import { Modal, Field, fieldCls } from '../components/Modal'
import { Icon } from '../components/Icon'
import { Cargando } from './Personal'
import type { Usuario } from '../types'

export function Usuarios() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: usuarios, isLoading } = useUsuariosTodos()
  const crear = useCrearUsuario()
  const actualizar = useUpdateUsuario()
  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [form, setForm] = useState({ nombre: '', email: '', rol: 'developer', password: '', activo: true })

  useHeader({ title: 'Usuarios', sub: 'Gestión del equipo' }, [])

  if (!esAdmin(user)) return <Navigate to="/" replace />
  if (isLoading || !usuarios) return <Cargando />

  function abrirNuevo() {
    setEditando(null)
    setForm({ nombre: '', email: '', rol: 'developer', password: '', activo: true })
    setOpen(true)
  }
  function abrirEditar(u: Usuario) {
    setEditando(u)
    setForm({ nombre: u.nombre, email: u.email, rol: u.rol, password: '', activo: u.activo })
    setOpen(true)
  }
  function guardar() {
    if (!form.nombre.trim() || !form.email.trim()) return
    if (editando) {
      const cambios: Record<string, unknown> = { nombre: form.nombre, email: form.email, rol: form.rol, activo: form.activo }
      if (form.password) cambios.password = form.password
      actualizar.mutate({ id: editando.id, cambios }, { onSuccess: () => setOpen(false) })
    } else {
      if (!form.password) return
      crear.mutate({ nombre: form.nombre, email: form.email, rol: form.rol, password: form.password }, { onSuccess: () => setOpen(false) })
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-[1100px] mx-auto">
      <div className="flex justify-end">
        <button onClick={abrirNuevo} className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition">
          <Icon name="plus" className="w-4 h-4" />Nuevo usuario
        </button>
      </div>

      <Card title={`Equipo (${usuarios.length})`} pad={false}>
        <div className="px-2 py-1.5">
          <div className="grid grid-cols-12 gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <span className="col-span-5">Persona</span><span className="col-span-4">Rol</span><span className="col-span-2">Estado</span><span className="col-span-1"></span>
          </div>
          {usuarios.map((u) => (
            <div key={u.id} className="group grid grid-cols-12 items-center gap-3 px-3 h-14 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <Avatar user={u} size="md" />
                <div className="min-w-0">
                  <button onClick={() => navigate(`/persona/${u.id}`)} className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate hover:text-emerald-600 dark:hover:text-emerald-400 block text-left">{u.nombre}</button>
                  <div className="text-[11px] text-zinc-400 truncate">{u.email}</div>
                </div>
              </div>
              <div className="col-span-4 text-[13px] text-zinc-600 dark:text-zinc-300">{u.rolLabel}</div>
              <div className="col-span-2">{u.activo ? <Badge tone="emerald" dot>Activo</Badge> : <Badge tone="zinc" dot>Inactivo</Badge>}</div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => abrirEditar(u)} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition"><Icon name="edit" className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editando ? 'Editar usuario' : 'Nuevo usuario'}
        footer={<>
          <button onClick={() => setOpen(false)} className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
          <button onClick={guardar} disabled={crear.isPending || actualizar.isPending} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50">Guardar</button>
        </>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"><input className={fieldCls} autoFocus value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} /></Field>
            <Field label="Email"><input type="email" className={fieldCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rol"><select className={fieldCls} value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}>{ROLES_USUARIO.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}><input type="password" className={fieldCls} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></Field>
          </div>
          {editando && (
            <label className="flex items-center gap-2 text-[13px] text-zinc-700 dark:text-zinc-200 cursor-pointer">
              <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={form.activo} onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} />
              Usuario activo
            </label>
          )}
        </div>
      </Modal>
    </div>
  )
}
