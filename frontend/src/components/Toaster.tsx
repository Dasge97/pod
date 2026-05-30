import { useToast } from '../stores/toast'
import { Icon } from './Icon'
import { cn } from '../lib/ui'

const ESTILO = {
  error: { wrap: 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10', icon: 'alert', color: 'text-red-600 dark:text-red-400' },
  success: { wrap: 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10', icon: 'check', color: 'text-emerald-600 dark:text-emerald-400' },
  info: { wrap: 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900', icon: 'dot', color: 'text-zinc-500' },
} as const

export function Toaster() {
  const { toasts, remove } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const e = ESTILO[t.tipo]
        return (
          <div key={t.id} className={cn('flex items-start gap-2.5 rounded-lg border shadow-lg px-3.5 py-3 text-[13px] animate-[slideIn_0.2s_ease-out]', e.wrap)}>
            <Icon name={e.icon} className={cn('w-4 h-4 mt-0.5 shrink-0', e.color)} />
            <span className="flex-1 text-zinc-700 dark:text-zinc-200">{t.mensaje}</span>
            <button onClick={() => remove(t.id)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"><Icon name="blocked" className="w-3.5 h-3.5" /></button>
          </div>
        )
      })}
    </div>
  )
}
