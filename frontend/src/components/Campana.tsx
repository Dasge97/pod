import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificaciones, useMarcarLeidas, useMarcarLeida } from '../api/hooks'
import { Icon } from './Icon'
import { cn, TONES, ACT_TONE, ACT_ICON } from '../lib/ui'
import { hace } from '../lib/format'
import type { Notificacion } from '../types'

function NotifItem({ n, onClick }: { n: Notificacion; onClick: () => void }) {
  const tone = ACT_TONE[n.tipo] || 'zinc'
  return (
    <button onClick={onClick} className={cn('w-full flex gap-2.5 px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition', !n.leida && 'bg-emerald-50/40 dark:bg-emerald-500/[0.06]')}>
      <span className={cn('mt-0.5 w-7 h-7 shrink-0 rounded-full flex items-center justify-center ring-1 ring-inset', TONES[tone].soft)}>
        <Icon name={ACT_ICON[n.tipo] || 'dot'} className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-snug text-zinc-700 dark:text-zinc-200">
          {n.autor && <span className="font-medium text-zinc-900 dark:text-zinc-100">{n.autor.nombre} </span>}{n.texto}
        </p>
        <span className="text-[11px] text-zinc-400">{hace(n.fecha)}</span>
      </div>
      {!n.leida && <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
    </button>
  )
}

export function Campana() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data } = useNotificaciones()
  const marcarTodas = useMarcarLeidas()
  const marcarUna = useMarcarLeida()

  const noLeidas = data?.noLeidas ?? 0
  const notificaciones = data?.notificaciones ?? []

  useEffect(() => {
    if (!open) return
    const cerrar = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [open])

  function abrirNotif(n: Notificacion) {
    if (!n.leida) marcarUna.mutate(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0">
        <Icon name="bell" className="w-4 h-4" />
        {noLeidas > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 h-11 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">Notificaciones</span>
            {noLeidas > 0 && <button onClick={() => marcarTodas.mutate()} className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Marcar leídas</button>}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {notificaciones.slice(0, 10).map((n) => <NotifItem key={n.id} n={n} onClick={() => abrirNotif(n)} />)}
            {notificaciones.length === 0 && <p className="px-3 py-8 text-[13px] text-zinc-400 text-center">No tienes notificaciones.</p>}
          </div>
          <button onClick={() => { setOpen(false); navigate('/notificaciones') }} className="w-full h-10 text-[12px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 transition">Ver todas</button>
        </div>
      )}
    </div>
  )
}
