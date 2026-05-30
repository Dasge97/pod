import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAnalizarPresupuesto, useCrearDesdeBorrador } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { Card, Badge } from '../components/ui'
import { Mascota } from '../components/Brand'
import { Icon } from '../components/Icon'
import { cn, TONES } from '../lib/ui'
import type { Borrador, BorradorFase } from '../types'

const inputCls = 'w-full bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition'
const sevTone: Record<string, 'red' | 'amber' | 'zinc'> = { alta: 'red', media: 'amber', baja: 'zinc' }

export function Asistente() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const oportunidadId = params.get('oportunidad') ? Number(params.get('oportunidad')) : undefined

  const analizar = useAnalizarPresupuesto()
  const crear = useCrearDesdeBorrador()

  const [step, setStep] = useState<'upload' | 'draft' | 'confirmed'>('upload')
  const [texto, setTexto] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [fuente, setFuente] = useState<'oportunidad' | 'texto' | 'archivo'>(oportunidadId ? 'oportunidad' : 'texto')

  // Borrador editable
  const [nombre, setNombre] = useState('')
  const [desc, setDesc] = useState('')
  const [fases, setFases] = useState<BorradorFase[]>([])
  const [riesgos, setRiesgos] = useState<Borrador['riesgos']>([])
  const [dependencias, setDependencias] = useState<string[]>([])
  const [simulado, setSimulado] = useState(false)
  const [proyectoCreadoId, setProyectoCreadoId] = useState<number | null>(null)

  useHeader({ crumbs: [{ label: 'Comercial', to: '/comercial' }, { label: 'Asistente IA' }] }, [])

  const totalHoras = fases.reduce((s, f) => s + f.tareas.reduce((a, t) => a + (Number(t.estimacionHoras) || 0), 0), 0)
  const totalTareas = fases.reduce((s, f) => s + f.tareas.length, 0)

  function cargarBorrador(b: Borrador) {
    setNombre(b.proyecto.nombre)
    setDesc(b.proyecto.descripcion)
    setFases(b.fases)
    setRiesgos(b.riesgos)
    setDependencias(b.dependencias)
    setSimulado(b.simulado)
    setStep('draft')
  }

  function lanzar() {
    const payload =
      fuente === 'archivo' && archivo ? { archivo }
      : fuente === 'oportunidad' && oportunidadId ? { oportunidadId }
      : { texto }
    analizar.mutate(payload, { onSuccess: cargarBorrador })
  }

  function confirmar() {
    crear.mutate(
      { oportunidadId, proyecto: { nombre, descripcion: desc }, fases },
      { onSuccess: (p) => { setProyectoCreadoId(p.id); setStep('confirmed') } },
    )
  }

  function editTarea(fi: number, ti: number, key: 'titulo' | 'estimacionHoras', val: string) {
    setFases((fs) => fs.map((f, i) => (i !== fi ? f : { ...f, tareas: f.tareas.map((t, j) => (j !== ti ? t : { ...t, [key]: key === 'estimacionHoras' ? Number(val) : val })) })))
  }
  const delTarea = (fi: number, ti: number) => setFases((fs) => fs.map((f, i) => (i !== fi ? f : { ...f, tareas: f.tareas.filter((_, j) => j !== ti) })))
  const addTarea = (fi: number) => setFases((fs) => fs.map((f, i) => (i !== fi ? f : { ...f, tareas: [...f.tareas, { titulo: 'Nueva tarea', estimacionHoras: 8 }] })))
  const delRiesgo = (i: number) => setRiesgos((rs) => rs.filter((_, j) => j !== i))

  /* ---------- Generando ---------- */
  if (analizar.isPending) {
    const pasos = ['Leyendo el documento', 'Identificando fases del proyecto', 'Estimando tareas y horas', 'Detectando riesgos y dependencias']
    return (
      <div className="p-6 max-w-xl mx-auto pt-20">
        <Card>
          <div className="text-center mb-5">
            <Mascota className="w-16 h-16 mx-auto mb-3 animate-bounce" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Analizando el presupuesto…</h3>
          </div>
          <ul className="space-y-2.5">
            {pasos.map((p, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                </span>
                <span className="text-[13px] text-zinc-800 dark:text-zinc-100 font-medium">{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    )
  }

  /* ---------- Confirmado ---------- */
  if (step === 'confirmed') {
    return (
      <div className="p-6 max-w-xl mx-auto pt-20 text-center">
        <Card>
          <Mascota className="w-20 h-20 mx-auto mb-3" />
          <span className="inline-flex w-10 h-10 rounded-2xl bg-emerald-500 text-white items-center justify-center mb-3"><Icon name="check" className="w-5 h-5" /></span>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Proyecto creado</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">«{nombre}» se ha creado con {fases.length} fases y {totalTareas} tareas iniciales.</p>
          <div className="flex justify-center gap-2 mt-5">
            <button onClick={() => navigate('/departamento')} className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[14px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Ir al departamento</button>
            {proyectoCreadoId && <button onClick={() => navigate(`/proyecto/${proyectoCreadoId}`)} className="h-10 px-4 rounded-lg bg-emerald-500 text-white text-[14px] font-medium hover:bg-emerald-600 transition flex items-center gap-2">Abrir proyecto<Icon name="chevron" className="w-4 h-4" /></button>}
          </div>
        </Card>
      </div>
    )
  }

  /* ---------- Subida ---------- */
  if (step === 'upload') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <Mascota className="w-20 h-20 mx-auto mb-2" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Generar proyecto a partir de un presupuesto</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg mx-auto">La IA propone fases, tareas, riesgos y estimaciones. Tú revisas y confirmas: nada se crea sin tu validación.</p>
        </div>

        <Card>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium text-zinc-400 mr-1">Origen:</span>
            {oportunidadId && (
              <button onClick={() => setFuente('oportunidad')} className={cn('flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] font-medium border transition', fuente === 'oportunidad' ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-300' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800')}>
                <Icon name="file" className="w-4 h-4" />Desde la oportunidad
              </button>
            )}
            <button onClick={() => setFuente('texto')} className={cn('flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] font-medium border transition', fuente === 'texto' ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-300' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800')}>
              <Icon name="edit" className="w-4 h-4" />Pegar texto
            </button>
            <button onClick={() => setFuente('archivo')} className={cn('flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] font-medium border transition', fuente === 'archivo' ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-300' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800')}>
              <Icon name="upload" className="w-4 h-4" />Subir archivo
            </button>
          </div>

          {fuente === 'texto' && (
            <textarea rows={6} value={texto} onChange={(e) => setTexto(e.target.value)} className={cn(inputCls, 'resize-none font-mono')} placeholder="Pega aquí el texto del presupuesto o del correo del cliente…" />
          )}
          {fuente === 'archivo' && (
            <label className="block rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition cursor-pointer p-8 text-center">
              <input type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
              <Icon name="upload" className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
              {archivo ? (
                <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200 mt-2">{archivo.name}</p>
              ) : (
                <>
                  <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200 mt-2">Arrastra el documento o haz clic para subir</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">PDF, DOCX o texto · hasta 20 MB</p>
                </>
              )}
            </label>
          )}
          {fuente === 'oportunidad' && (
            <div className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40 px-3 py-3">
              <span className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-emerald-500"><Icon name="file" className="w-4 h-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">Presupuesto de la oportunidad #{oportunidadId}</div>
                <div className="text-[11px] text-zinc-400">Se usará la información del presupuesto registrado.</div>
              </div>
              <Badge tone="emerald" dot={false}>Detectado</Badge>
            </div>
          )}

          {analizar.isError && <p className="mt-3 text-[13px] text-red-600 dark:text-red-400">No se pudo analizar. Revisa el texto, el archivo o la oportunidad.</p>}

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => navigate(-1)} className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[14px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
            <button onClick={lanzar} disabled={(fuente === 'texto' && texto.trim() === '') || (fuente === 'archivo' && !archivo)} className="h-10 px-4 rounded-lg bg-emerald-500 text-white text-[14px] font-medium hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50"><Icon name="sparkles" className="w-4 h-4" />Generar borrador</button>
          </div>
        </Card>
      </div>
    )
  }

  /* ---------- Borrador editable ---------- */
  return (
    <div className="p-6 space-y-5 max-w-[1100px] mx-auto pb-24">
      <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-500/[0.07] px-4 py-3">
        <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0"><Icon name="sparkles" className="w-4 h-4" /></span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">Borrador pendiente de validar</span>
            <Badge tone="amber" dot={false}>Generado por IA</Badge>
            {simulado && <Badge tone="zinc" dot={false}>modo demo (sin API key)</Badge>}
          </div>
          <p className="text-[12px] text-amber-700/90 dark:text-amber-200/70 mt-0.5">Revisa y ajusta cada sección. El proyecto no existe hasta que lo confirmes.</p>
        </div>
      </div>

      <Card title="Proyecto propuesto">
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={cn(inputCls, 'font-medium')} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Descripción</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className={cn(inputCls, 'resize-none')} />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-400">Fases</span><span className="font-mono text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{fases.length}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-400">Tareas</span><span className="font-mono text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{totalTareas}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-400">Estimación</span><span className="font-mono text-[13px] font-medium text-emerald-600 dark:text-emerald-400">{totalHoras} h</span></div>
        </div>
      </Card>

      <Card title="Fases y tareas iniciales" action={<span className="text-xs text-zinc-400">editable</span>}>
        <div className="space-y-4">
          {fases.map((f, fi) => {
            const horasFase = f.tareas.reduce((a, t) => a + (Number(t.estimacionHoras) || 0), 0)
            return (
              <div key={fi} className="rounded-lg border border-zinc-150 dark:border-zinc-800">
                <div className="flex items-center justify-between px-3 h-10 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-zinc-400">{String(fi + 1).padStart(2, '0')}</span>
                    <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{f.nombre}</span>
                    <span className="text-[11px] text-zinc-400">· {f.tareas.length} tareas</span>
                  </div>
                  <span className="font-mono text-[12px] font-medium text-zinc-500 dark:text-zinc-400">{horasFase} h</span>
                </div>
                <div className="p-2 space-y-1">
                  {f.tareas.map((t, ti) => (
                    <div key={ti} className="group flex items-center gap-2 px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                      <input value={t.titulo} onChange={(e) => editTarea(fi, ti, 'titulo', e.target.value)} className="flex-1 bg-transparent text-[13px] text-zinc-800 dark:text-zinc-100 px-1.5 py-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 focus:bg-zinc-50 dark:focus:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition" />
                      <div className="flex items-center gap-1 shrink-0">
                        <input type="number" value={t.estimacionHoras} onChange={(e) => editTarea(fi, ti, 'estimacionHoras', e.target.value)} className="w-14 bg-transparent font-mono text-[12px] text-right text-zinc-600 dark:text-zinc-300 px-1.5 py-1 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                        <span className="text-[11px] text-zinc-400">h</span>
                      </div>
                      <button onClick={() => delTarea(fi, ti)} className="w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition shrink-0"><Icon name="blocked" className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => addTarea(fi)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-zinc-400 hover:text-emerald-600 transition"><Icon name="plus" className="w-3.5 h-3.5" />Añadir tarea</button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Riesgos detectados" action={<span className="text-xs text-zinc-400">{riesgos.length}</span>}>
          <div className="space-y-2">
            {riesgos.map((r, i) => (
              <div key={i} className="group flex items-start gap-2.5 rounded-lg border border-zinc-150 dark:border-zinc-800 px-3 py-2.5">
                <Icon name="alert" className={cn('w-4 h-4 mt-0.5 shrink-0', TONES[sevTone[r.severidad]].text)} />
                <p className="flex-1 text-[12px] text-zinc-700 dark:text-zinc-300 leading-snug">{r.texto}</p>
                <Badge tone={sevTone[r.severidad]} dot={false} className="capitalize shrink-0">{r.severidad}</Badge>
                <button onClick={() => delRiesgo(i)} className="w-5 h-5 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition shrink-0"><Icon name="blocked" className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {riesgos.length === 0 && <p className="text-[13px] text-zinc-400 py-2 text-center">Sin riesgos.</p>}
          </div>
        </Card>

        <Card title="Dependencias">
          <ul className="space-y-2">
            {dependencias.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12px] text-zinc-700 dark:text-zinc-300">
                <Icon name="link" className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                <span className="leading-snug">{d}</span>
              </li>
            ))}
            {dependencias.length === 0 && <li className="text-[13px] text-zinc-400 text-center">Sin dependencias.</li>}
          </ul>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-6 py-3 z-20">
        <div className="max-w-[1100px] mx-auto flex items-center gap-3">
          <Icon name="sparkles" className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-[12px] text-zinc-500 dark:text-zinc-400 flex-1 hidden sm:block">Al confirmar se creará el proyecto con {totalTareas} tareas ({totalHoras} h estimadas).</span>
          <button onClick={() => setStep('upload')} className="h-9 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Descartar</button>
          <button onClick={confirmar} disabled={crear.isPending} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50"><Icon name="check" className="w-4 h-4" />Confirmar y crear proyecto</button>
        </div>
      </div>
    </div>
  )
}
