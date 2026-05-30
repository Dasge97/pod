import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Icon } from './Icon'
import { Logo, Mascota } from './Brand'
import { Avatar } from './ui'
import { cn } from '../lib/ui'
import { api } from '../api/client'
import { useAuth } from '../stores/auth'
import { useUi } from '../stores/ui'
import type { Bloqueo } from '../types'

function NavItem({ icon, label, active, badge, onClick }: { icon: string; label: string; active: boolean; badge?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[13px] font-medium transition',
        active
          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50',
      )}
    >
      <Icon name={icon} className={cn('w-4 h-4', active && 'text-emerald-600 dark:text-emerald-400')} />
      <span className="flex-1 text-left">{label}</span>
      {badge != null && (
        <span className={cn('font-mono text-[11px] px-1.5 rounded', badge > 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300' : 'text-zinc-400')}>{badge}</span>
      )}
    </button>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useUi()

  const ir = (path: string) => { navigate(path); onNavigate?.() }

  const { data: bloqueos } = useQuery({
    queryKey: ['blockers', 'activos'],
    queryFn: async () => (await api.get<Bloqueo[]>('/blockers?resuelto=false')).data,
  })
  const bloqueosActivos = bloqueos?.length ?? 0

  const en = (p: string) => (p === '/' ? pathname === '/' : pathname.startsWith(p))

  return (
    <aside className="w-60 shrink-0 h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex flex-col items-center gap-1.5 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <Mascota className="h-16 w-auto" />
        <Logo className="h-6 w-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          <NavItem icon="home" label="Mi panel" active={pathname === '/'} onClick={() => ir('/')} />
          <NavItem icon="layers" label="Departamento" active={en('/departamento') || en('/persona')} onClick={() => ir('/departamento')} />
          <NavItem icon="trending" label="Comercial" active={en('/comercial')} onClick={() => ir('/comercial')} />
          <NavItem icon="folder" label="Proyectos" active={en('/proyecto')} onClick={() => ir('/proyectos')} />
          <NavItem icon="file" label="Oportunidades" active={en('/oportunidad')} onClick={() => ir('/oportunidades')} />
          <NavItem icon="alert" label="Bloqueos" active={en('/bloqueos')} badge={bloqueosActivos} onClick={() => ir('/bloqueos')} />
          <NavItem icon="sparkles" label="Asistente IA" active={en('/asistente')} onClick={() => ir('/asistente')} />
        </div>
      </nav>

      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[13px] font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50 transition"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
          <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
        <div className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-md">
          <Avatar user={user} size="lg" />
          <div className="leading-tight min-w-0 flex-1">
            <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-50 truncate">{user?.nombre}</div>
            <div className="text-[11px] text-zinc-400 truncate">{user?.rolLabel}</div>
          </div>
          <button onClick={logout} title="Cerrar sesión" className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition">
            <Icon name="logout" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
