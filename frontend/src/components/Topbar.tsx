import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { useUi } from '../stores/ui'

export function Topbar() {
  const navigate = useNavigate()
  const { header } = useUi()
  const { title, sub, crumbs } = header

  return (
    <header className="h-14 shrink-0 flex items-center gap-4 px-6 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
      <div className="min-w-0 flex-1">
        {crumbs ? (
          <div className="flex items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <Icon name="chevron" className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />}
                {c.to ? (
                  <button onClick={() => navigate(c.to!)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">{c.label}</button>
                ) : (
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{c.label}</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="leading-tight">
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
            {sub && <p className="text-xs text-zinc-400">{sub}</p>}
          </div>
        )}
      </div>
      <div className="hidden md:flex items-center h-9 px-3 gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 w-64 bg-zinc-50/50 dark:bg-zinc-800/30">
        <Icon name="search" className="w-4 h-4" />
        <span className="text-[13px]">Buscar…</span>
        <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400">⌘K</kbd>
      </div>
      <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
        <Icon name="bell" className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
      </button>
    </header>
  )
}
