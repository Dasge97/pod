import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { Campana } from './Campana'
import { NuevaTareaModal } from './NuevaTareaModal'
import { useProyectos, useUsuarios } from '../api/hooks'
import { useAuth } from '../stores/auth'
import { esEncargado } from '../lib/permisos'
import { useUi } from '../stores/ui'

export function Topbar() {
  const navigate = useNavigate()
  const { header, toggleSidebar } = useUi()
  const { title, sub, crumbs } = header
  const { user } = useAuth()
  const esManager = esEncargado(user)
  const [tareaOpen, setTareaOpen] = useState(false)
  const { data: proyectos = [] } = useProyectos()
  const { data: usuarios = [] } = useUsuarios()

  return (
    <>
      <header className="h-14 shrink-0 flex items-center gap-3 px-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <button onClick={toggleSidebar} title="Mostrar/ocultar menú"
          className="w-9 h-9 -ml-1 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0">
          <Icon name="menu" className="w-5 h-5" />
        </button>
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
        <button onClick={() => setTareaOpen(true)} title="Nueva tarea"
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition shrink-0">
          <Icon name="plus" className="w-4 h-4" /><span className="hidden sm:inline">Nueva tarea</span>
        </button>
        <Campana />
      </header>

      <NuevaTareaModal
        open={tareaOpen}
        onClose={() => setTareaOpen(false)}
        proyectos={proyectos.map((p) => ({ id: p.id, nombre: p.nombre }))}
        usuarios={esManager ? usuarios : undefined}
        asignadoFijo={!esManager && user ? { id: user.id, nombre: user.nombre } : undefined}
      />
    </>
  )
}
