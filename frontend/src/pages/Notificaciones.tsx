import { useNavigate } from 'react-router-dom'
import { useNotificaciones, useMarcarLeidas, useMarcarLeida } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { Card } from '../components/ui'
import { EmptyState } from '../components/Brand'
import { Icon } from '../components/Icon'
import { cn, TONES, ACT_TONE, ACT_ICON } from '../lib/ui'
import { hace } from '../lib/format'
import { Cargando } from './Personal'
import type { Notificacion } from '../types'

export function Notificaciones() {
  const navigate = useNavigate()
  const { data, isLoading } = useNotificaciones()
  const marcarTodas = useMarcarLeidas()
  const marcarUna = useMarcarLeida()
  useHeader({ title: 'Notificaciones', sub: 'Todo lo que requiere tu atención' }, [])

  if (isLoading || !data) return <Cargando />

  const { notificaciones, noLeidas } = data

  function abrir(n: Notificacion) {
    if (!n.leida) marcarUna.mutate(n.id)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="p-6 space-y-5 max-w-[820px] mx-auto">
      {noLeidas > 0 && (
        <div className="flex justify-end">
          <button onClick={() => marcarTodas.mutate()} className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
            <Icon name="check" className="w-4 h-4" />Marcar todas como leídas
          </button>
        </div>
      )}

      <Card title={`Notificaciones${noLeidas > 0 ? ` · ${noLeidas} sin leer` : ''}`} pad={false}>
        {notificaciones.length === 0 ? (
          <EmptyState titulo="No tienes notificaciones">Aquí aparecerá lo que ocurra en tus proyectos y tareas.</EmptyState>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {notificaciones.map((n) => {
              const tone = ACT_TONE[n.tipo] || 'zinc'
              return (
                <button key={n.id} onClick={() => abrir(n)} className={cn('w-full flex gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition', !n.leida && 'bg-emerald-50/40 dark:bg-emerald-500/[0.06]')}>
                  <span className={cn('mt-0.5 w-8 h-8 shrink-0 rounded-full flex items-center justify-center ring-1 ring-inset', TONES[tone].soft)}>
                    <Icon name={ACT_ICON[n.tipo] || 'dot'} className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-zinc-700 dark:text-zinc-200">
                      {n.autor && <span className="font-medium text-zinc-900 dark:text-zinc-100">{n.autor.nombre} </span>}{n.texto}
                    </p>
                    <span className="text-[11px] text-zinc-400">{hace(n.fecha)}</span>
                  </div>
                  {!n.leida && <span className="mt-2 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
