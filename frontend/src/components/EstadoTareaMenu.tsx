import { useState, useRef, useEffect } from 'react'
import { useUpdateTarea } from '../api/hooks'
import { TareaBadge } from './ui'
import { Icon } from './Icon'
import { cn, TAREA_ESTADO_TONE, TONES } from '../lib/ui'
import type { Tarea } from '../types'

const ESTADOS: [string, string][] = [
  ['pendiente', 'Pendiente'],
  ['progreso', 'En progreso'],
  ['bloqueada', 'Bloqueada'],
  ['finalizada', 'Finalizada'],
]

/** Badge de estado de tarea que, al pulsar, despliega las opciones para cambiarlo con un clic. */
export function EstadoTareaMenu({ tarea }: { tarea: Tarea }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const update = useUpdateTarea()

  useEffect(() => {
    if (!open) return
    const cerrar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [open])

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 rounded-md hover:opacity-80 transition" title="Cambiar estado">
        <TareaBadge estado={tarea.estado} label={tarea.estadoLabel} />
        <Icon name="chevron" className="w-3 h-3 text-zinc-300 dark:text-zinc-600 rotate-90" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg z-30 py-1">
          {ESTADOS.map(([v, l]) => (
            <button
              key={v}
              onClick={() => { if (v !== tarea.estado) update.mutate({ id: tarea.id, cambios: { estado: v as Tarea['estado'] } }); setOpen(false) }}
              className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition', v === tarea.estado ? 'font-semibold text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-300')}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', TONES[TAREA_ESTADO_TONE[v]].dot)} />
              {l}
              {v === tarea.estado && <Icon name="check" className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
