import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProyecto, useProyectoTareas, useProyectoBloqueos, useProyectoMiembros, useProyectoActividad, useResolverBloqueo, useUpdateProyecto, useUsuarios, useAddMiembro, useRemoveMiembro, useComentarProyecto, useCrearBloqueo } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { useAuth } from '../stores/auth'
import { esEncargado } from '../lib/permisos'
import { Card, EstadoBadge, PrioridadBadge, Badge, Avatar, Progress } from '../components/ui'
import { TareaRow } from '../components/rows'
import { Modal, Field, fieldCls } from '../components/Modal'
import { NuevaTareaModal } from '../components/NuevaTareaModal'
import { Icon } from '../components/Icon'
import { cn, TONES, barTone, ROL_PART_TONE, type Tone } from '../lib/ui'
import { fmtFechaCorta, hace } from '../lib/format'
import { Cargando } from './Personal'

const ESTADOS_PROYECTO: [string, string][] = [['pendiente', 'Pendiente'], ['progreso', 'En progreso'], ['bloqueado', 'Bloqueado'], ['revision', 'En revisión'], ['finalizado', 'Finalizado']]
const PRIORIDADES: [string, string][] = [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta'], ['critica', 'Crítica']]
const ROLES_PROYECTO: [string, string][] = [['responsable', 'Responsable'], ['colaborador', 'Colaborador'], ['consultado', 'Consultado']]

function DateBox({ label, value, icon, tone = 'zinc' }: { label: string; value: string; icon: string; tone?: Tone }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-inset', TONES[tone].soft)}><Icon name={icon} className="w-4 h-4" /></span>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{label}</div>
        <div className="font-mono text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{value || '—'}</div>
      </div>
    </div>
  )
}

export function Proyecto() {
  const { id } = useParams()
  const pid = Number(id)
  const { data: p, isLoading } = useProyecto(pid)
  const { data: tareas = [] } = useProyectoTareas(pid)
  const { data: bloqueos = [] } = useProyectoBloqueos(pid)
  const { data: miembros = [] } = useProyectoMiembros(pid)
  const { data: actividad = [] } = useProyectoActividad(pid)
  const resolver = useResolverBloqueo()
  const { user } = useAuth()
  const puedeGestionar = esEncargado(user)
  const actualizar = useUpdateProyecto()
  const addMiembro = useAddMiembro()
  const removeMiembro = useRemoveMiembro()
  const comentar = useComentarProyecto()
  const crearBloqueo = useCrearBloqueo()
  const [comentario, setComentario] = useState('')
  const [bloqueoOpen, setBloqueoOpen] = useState(false)
  const [formBloqueo, setFormBloqueo] = useState({ titulo: '', descripcion: '', severidad: 'alta' })
  const { data: usuarios = [] } = useUsuarios()
  const [editOpen, setEditOpen] = useState(false)
  const [tareaOpen, setTareaOpen] = useState(false)
  const [partOpen, setPartOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', estado: 'pendiente', prioridad: 'media', progreso: 0, responsable: '' as number | '', fechaInicio: '', fechaFinEstimada: '', fechaFinReal: '' })
  const [nuevoPart, setNuevoPart] = useState({ usuario: '' as number | '', rol: 'colaborador' })

  useHeader({ crumbs: [{ label: 'Departamento', to: '/departamento' }, { label: p?.nombre ?? '…' }] }, [p?.nombre])

  if (isLoading || !p) return <Cargando />

  const activos = bloqueos.filter((b) => !b.resuelto)
  const finalizadas = tareas.filter((t) => t.estado === 'finalizada').length

  function abrirEdicion() {
    setForm({
      nombre: p!.nombre, descripcion: p!.descripcion ?? '', estado: p!.estado, prioridad: p!.prioridad,
      progreso: p!.progreso, responsable: p!.responsable?.id ?? '',
      fechaInicio: p!.fechaInicio ?? '', fechaFinEstimada: p!.fechaFinEstimada ?? '', fechaFinReal: p!.fechaFinReal ?? '',
    })
    setEditOpen(true)
  }

  function guardarEdicion() {
    actualizar.mutate({ id: pid, cambios: {
      nombre: form.nombre, descripcion: form.descripcion || null,
      estado: form.estado, prioridad: form.prioridad, progreso: Number(form.progreso),
      responsable: form.responsable || undefined,
      fechaInicio: form.fechaInicio || null, fechaFinEstimada: form.fechaFinEstimada || null, fechaFinReal: form.fechaFinReal || null,
    } }, { onSuccess: () => setEditOpen(false) })
  }

  function anadirParticipante() {
    if (!nuevoPart.usuario) return
    addMiembro.mutate({ proyectoId: pid, usuario: Number(nuevoPart.usuario), rol: nuevoPart.rol },
      { onSuccess: () => { setPartOpen(false); setNuevoPart({ usuario: '', rol: 'colaborador' }) } })
  }

  function enviarComentario() {
    if (!comentario.trim()) return
    comentar.mutate({ proyectoId: pid, texto: comentario.trim() }, { onSuccess: () => setComentario('') })
  }

  function registrarBloqueo() {
    if (!formBloqueo.titulo.trim()) return
    crearBloqueo.mutate({ proyecto: pid, titulo: formBloqueo.titulo, descripcion: formBloqueo.descripcion || null, severidad: formBloqueo.severidad },
      { onSuccess: () => { setBloqueoOpen(false); setFormBloqueo({ titulo: '', descripcion: '', severidad: 'alta' }) } })
  }

  const idsParticipantes = miembros.map((m) => m.usuario.id)
  const disponiblesParaAnadir = usuarios.filter((u) => !idsParticipantes.includes(u.id))

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <EstadoBadge estado={p.estado} label={p.estadoLabel} />
              <PrioridadBadge prioridad={p.prioridad} label={p.prioridadLabel} />
              {p.retrasado && <Badge tone="amber"><Icon name="clock" className="w-3 h-3" />Retrasado</Badge>}
              {activos.length > 0 && <Badge tone="red"><Icon name="alert" className="w-3 h-3" />{activos.length} bloqueo{activos.length > 1 ? 's' : ''}</Badge>}
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{p.nombre}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">{p.descripcion}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-zinc-400">Cliente</span>
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{p.cliente}</span>
              <span className="mx-1 text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Responsable</span>
              <Avatar user={p.responsable} size="sm" />
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{p.responsable?.nombre}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setBloqueoOpen(true)} className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400 transition flex items-center gap-1.5"><Icon name="alert" className="w-4 h-4" />Bloqueo</button>
            {puedeGestionar && <>
              <button onClick={abrirEdicion} className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1.5"><Icon name="edit" className="w-4 h-4" />Editar</button>
              <button onClick={() => setTareaOpen(true)} className="h-9 px-3 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition flex items-center gap-1.5"><Icon name="plus" className="w-4 h-4" />Nueva tarea</button>
            </>}
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Progreso</span>
              <span className="font-mono text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{p.progreso}%</span>
            </div>
            <Progress value={p.progreso} tone={barTone(p.estado)} />
            <div className="text-[11px] text-zinc-400 mt-1.5">{finalizadas}/{tareas.length} tareas · {p.tareasPend} pendientes</div>
          </div>
          <DateBox label="Inicio" value={fmtFechaCorta(p.fechaInicio)} icon="calendar" />
          <DateBox label="Fin estimada" value={fmtFechaCorta(p.fechaFinEstimada)} icon="calendar" tone={p.retrasado ? 'amber' : 'zinc'} />
          <DateBox label="Fin real" value={fmtFechaCorta(p.fechaFinReal)} icon="check" tone={p.fechaFinReal ? 'emerald' : 'zinc'} />
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {activos.length > 0 && (
            <Card title="Bloqueos del proyecto" action={<span className="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-500/15 px-1.5 rounded">{activos.length} activo{activos.length > 1 ? 's' : ''}</span>}>
              <div className="space-y-2.5">
                {activos.map((b) => (
                  <div key={b.id} className="rounded-lg border border-red-200/70 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/[0.07] p-3">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center"><Icon name="alert" className="w-4 h-4" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge tone={b.severidad === 'critica' ? 'red' : 'amber'} dot={false} className="capitalize">{b.severidadLabel}</Badge>
                          <span className="text-[11px] text-zinc-400">hace {b.diasAbierto} d · {b.creadoPor?.nombre}</span>
                        </div>
                        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{b.titulo}</p>
                        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{b.descripcion}</p>
                      </div>
                      <button onClick={() => resolver.mutate({ id: b.id, proyectoId: pid })} disabled={resolver.isPending}
                        className="shrink-0 h-7 px-2.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[12px] font-medium text-zinc-700 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-600 transition disabled:opacity-50">Resolver</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Tareas" pad={false} action={<span className="text-xs text-zinc-400 font-mono">{tareas.filter((t) => t.estado !== 'finalizada').length} activas · {finalizadas} hechas</span>}>
            <div className="px-2 py-1.5">
              {tareas.filter((t) => t.estado !== 'finalizada').map((t) => <TareaRow key={t.id} t={t} showProyecto={false} />)}
              {tareas.length > 0 && tareas.filter((t) => t.estado !== 'finalizada').length === 0 && <p className="px-3 py-6 text-sm text-zinc-400 text-center">Todas las tareas están completadas. 🎉</p>}
              {tareas.length === 0 && <p className="px-3 py-6 text-sm text-zinc-400 text-center">Este proyecto aún no tiene tareas.</p>}

              {finalizadas > 0 && (
                <details className="mt-1">
                  <summary className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 select-none flex items-center gap-1.5">
                    <Icon name="check" className="w-3.5 h-3.5" />Completadas ({finalizadas})
                  </summary>
                  <div className="opacity-75">
                    {tareas.filter((t) => t.estado === 'finalizada').map((t) => <TareaRow key={t.id} t={t} showProyecto={false} />)}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Participantes" pad={false} action={
            puedeGestionar && disponiblesParaAnadir.length > 0 && (
              <button onClick={() => setPartOpen(true)} className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"><Icon name="plus" className="w-3.5 h-3.5" />Añadir</button>
            )
          }>
            <div className="px-2 py-2 space-y-0.5">
              {miembros.map((pp) => (
                <div key={pp.usuario.id} className="group flex items-center gap-3 px-3 h-12">
                  <Avatar user={pp.usuario} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{pp.usuario.nombre}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{pp.usuario.rolLabel}</div>
                  </div>
                  <Badge tone={ROL_PART_TONE[pp.rol]} dot={false}>{pp.rolLabel}</Badge>
                  {puedeGestionar && (
                    <button onClick={() => removeMiembro.mutate({ proyectoId: pid, usuarioId: pp.usuario.id })} title="Quitar del proyecto"
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition shrink-0"><Icon name="blocked" className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              ))}
              {miembros.length === 0 && <p className="px-3 py-4 text-sm text-zinc-400 text-center">Sin participantes. Añade personas al proyecto.</p>}
            </div>
          </Card>

          <Card title="Actividad del proyecto" pad={false}>
            <div className="px-3 pt-3 pb-1">
              <div className="flex gap-2">
                <input value={comentario} onChange={(e) => setComentario(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enviarComentario() }}
                  placeholder="Escribe un comentario…" className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[13px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition" />
                <button onClick={enviarComentario} disabled={!comentario.trim() || comentar.isPending} className="h-9 px-3 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50 shrink-0">Enviar</button>
              </div>
            </div>
            <ul className="px-4 py-1 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[380px] overflow-y-auto">
              {actividad.map((a) => (
                <li key={a.id} className="flex gap-3 py-2.5">
                  <span className={cn('mt-0.5 w-7 h-7 shrink-0 rounded-full flex items-center justify-center ring-1 ring-inset', TONES[a.familia === 'bloqueo' ? 'red' : a.familia === 'tarea' ? 'blue' : 'zinc'].soft)}>
                    <Icon name={a.familia === 'bloqueo' ? 'alert' : a.familia === 'tarea' ? 'checkbox' : 'flag'} className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{a.usuario?.nombre}</span> {a.texto} {a.objeto}
                    </p>
                    <span className="text-xs text-zinc-400">{hace(a.fecha)}</span>
                  </div>
                </li>
              ))}
              {actividad.length === 0 && <li className="py-4 text-sm text-zinc-400 text-center">Sin actividad todavía.</li>}
            </ul>
          </Card>
        </div>
      </div>

      {/* Modal: editar proyecto */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar proyecto"
        footer={<>
          <button onClick={() => setEditOpen(false)} className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
          <button onClick={guardarEdicion} disabled={actualizar.isPending} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50">Guardar</button>
        </>}>
        <div className="space-y-4">
          <Field label="Nombre"><input className={fieldCls} value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} /></Field>
          <Field label="Descripción"><textarea className={cn(fieldCls, 'h-auto py-2 resize-none')} rows={2} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado"><select className={fieldCls} value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}>{ESTADOS_PROYECTO.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="Prioridad"><select className={fieldCls} value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value }))}>{PRIORIDADES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Progreso (${form.progreso}%)`}><input type="range" min={0} max={100} className="w-full accent-emerald-500" value={form.progreso} onChange={(e) => setForm((f) => ({ ...f, progreso: Number(e.target.value) }))} /></Field>
            <Field label="Responsable"><select className={fieldCls} value={form.responsable} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value ? Number(e.target.value) : '' }))}>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Inicio"><input type="date" className={fieldCls} value={form.fechaInicio} onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))} /></Field>
            <Field label="Fin estimada"><input type="date" className={fieldCls} value={form.fechaFinEstimada} onChange={(e) => setForm((f) => ({ ...f, fechaFinEstimada: e.target.value }))} /></Field>
            <Field label="Fin real"><input type="date" className={fieldCls} value={form.fechaFinReal} onChange={(e) => setForm((f) => ({ ...f, fechaFinReal: e.target.value }))} /></Field>
          </div>
        </div>
      </Modal>

      {/* Modal: nueva tarea (componente reutilizable) */}
      <NuevaTareaModal
        open={tareaOpen}
        onClose={() => setTareaOpen(false)}
        proyectoFijo={{ id: pid, nombre: p.nombre }}
        usuarios={usuarios}
        participantesIds={idsParticipantes}
      />

      {/* Modal: registrar bloqueo */}
      <Modal open={bloqueoOpen} onClose={() => setBloqueoOpen(false)} title="Registrar bloqueo"
        footer={<>
          <button onClick={() => setBloqueoOpen(false)} className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
          <button onClick={registrarBloqueo} disabled={crearBloqueo.isPending || !formBloqueo.titulo.trim()} className="h-9 px-4 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition disabled:opacity-50">Registrar</button>
        </>}>
        <div className="space-y-4">
          <Field label="¿Qué está bloqueado?"><input className={fieldCls} autoFocus value={formBloqueo.titulo} onChange={(e) => setFormBloqueo((f) => ({ ...f, titulo: e.target.value }))} /></Field>
          <Field label="Descripción"><textarea className={cn(fieldCls, 'h-auto py-2 resize-none')} rows={3} value={formBloqueo.descripcion} onChange={(e) => setFormBloqueo((f) => ({ ...f, descripcion: e.target.value }))} placeholder="Explica el impedimento…" /></Field>
          <Field label="Severidad"><select className={fieldCls} value={formBloqueo.severidad} onChange={(e) => setFormBloqueo((f) => ({ ...f, severidad: e.target.value }))}><option value="critica">Crítica</option><option value="alta">Alta</option><option value="media">Media</option></select></Field>
        </div>
      </Modal>

      {/* Modal: añadir participante */}
      <Modal open={partOpen} onClose={() => setPartOpen(false)} title="Añadir participante"
        footer={<>
          <button onClick={() => setPartOpen(false)} className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
          <button onClick={anadirParticipante} disabled={addMiembro.isPending || !nuevoPart.usuario} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition disabled:opacity-50">Añadir</button>
        </>}>
        <div className="space-y-4">
          <Field label="Persona">
            <select className={fieldCls} value={nuevoPart.usuario} onChange={(e) => setNuevoPart((p) => ({ ...p, usuario: e.target.value ? Number(e.target.value) : '' }))}>
              <option value="">Selecciona…</option>
              {disponiblesParaAnadir.map((u) => <option key={u.id} value={u.id}>{u.nombre} · {u.rolLabel}</option>)}
            </select>
          </Field>
          <Field label="Rol en el proyecto">
            <select className={fieldCls} value={nuevoPart.rol} onChange={(e) => setNuevoPart((p) => ({ ...p, rol: e.target.value }))}>
              {ROLES_PROYECTO.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
