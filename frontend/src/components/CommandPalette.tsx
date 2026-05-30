import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProyectos, useUsuarios, useOportunidades } from '../api/hooks'
import { useCommand } from '../stores/command'
import { Icon } from './Icon'
import { Avatar } from './ui'
import { cn } from '../lib/ui'

interface Resultado { tipo: 'proyecto' | 'persona' | 'oportunidad'; id: number; titulo: string; sub: string; to: string; icon: string }

export function CommandPalette() {
  const navigate = useNavigate()
  const { open, cerrar, toggle } = useCommand()
  const [q, setQ] = useState('')

  const { data: proyectos = [] } = useProyectos()
  const { data: usuarios = [] } = useUsuarios()
  const { data: oportunidades = [] } = useOportunidades()

  // Atajo de teclado global ⌘K / Ctrl+K.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); toggle() }
      if (e.key === 'Escape') cerrar()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [toggle, cerrar])

  useEffect(() => { if (open) setQ('') }, [open])

  const resultados = useMemo<Resultado[]>(() => {
    const t = q.trim().toLowerCase()
    const match = (s: string) => s.toLowerCase().includes(t)
    const res: Resultado[] = []
    if (t === '') return res
    for (const p of proyectos) if (match(p.nombre) || match(p.cliente)) res.push({ tipo: 'proyecto', id: p.id, titulo: p.nombre, sub: p.cliente, to: `/proyecto/${p.id}`, icon: 'folder' })
    for (const u of usuarios) if (match(u.nombre) || match(u.email)) res.push({ tipo: 'persona', id: u.id, titulo: u.nombre, sub: u.rolLabel, to: `/persona/${u.id}`, icon: 'users' })
    for (const o of oportunidades) if (match(o.cliente) || match(o.nombre)) res.push({ tipo: 'oportunidad', id: o.id, titulo: o.cliente, sub: o.nombre, to: `/oportunidad/${o.id}`, icon: 'trending' })
    return res.slice(0, 12)
  }, [q, proyectos, usuarios, oportunidades])

  if (!open) return null

  function ir(r: Resultado) { cerrar(); navigate(r.to) }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cerrar} />
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 h-12 border-b border-zinc-100 dark:border-zinc-800">
          <Icon name="search" className="w-4 h-4 text-zinc-400" />
          <input
            autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && resultados[0]) ir(resultados[0]) }}
            placeholder="Buscar proyectos, personas, oportunidades…"
            className="flex-1 bg-transparent text-[14px] text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder:text-zinc-400"
          />
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400">esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-1.5">
          {q.trim() === '' && <p className="px-4 py-6 text-[13px] text-zinc-400 text-center">Escribe para buscar en todo el departamento.</p>}
          {q.trim() !== '' && resultados.length === 0 && <p className="px-4 py-6 text-[13px] text-zinc-400 text-center">Sin resultados para «{q}».</p>}
          {resultados.map((r) => (
            <button key={`${r.tipo}-${r.id}`} onClick={() => ir(r)} className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
              {r.tipo === 'persona' ? (
                <Avatar user={usuarios.find((u) => u.id === r.id)} size="sm" />
              ) : (
                <span className={cn('w-7 h-7 shrink-0 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500')}><Icon name={r.icon} className="w-3.5 h-3.5" /></span>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{r.titulo}</div>
                <div className="text-[11px] text-zinc-400 truncate">{r.sub}</div>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-300 dark:text-zinc-600">{r.tipo}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
