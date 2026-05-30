import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Icon } from './Icon'
import { Logo } from './Brand'
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

export function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useUi()

  const { data: bloqueos } = useQuery({
    queryKey: ['blockers', 'activos'],
    queryFn: async () => (await api.get<Bloqueo[]>('/blockers?resuelto=false')).data,
  })
  const bloqueosActivos = bloqueos?.length ?? 0

  const en = (p: string) => (p === '/' ? pathname === '/' : pathname.startsWith(p))

  return (
    <aside className="w-60 shrink-0 h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-zinc-100 dark:border-zinc-800">
        <Logo className="h-8 w-auto" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">POD</div>
          <div className="text-[10px] text-zinc-400 -mt-0.5">Panel Operativo de Desarrollo</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-0.5">
          <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Paneles</div>
          <NavItem icon="home" label="Mi panel" active={en('/') } onClick={() => navigate('/')} />
          <NavItem icon="layers" label="Departamento" active={en('/departamento')} onClick={() => navigate('/departamento')} />
          <NavItem icon="trending" label="Comercial" active={en('/comercial')} onClick={() => navigate('/comercial')} />
        </div>
        <div className="space-y-0.5">
          <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Operación</div>
          <NavItem icon="folder" label="Proyectos" active={en('/proyecto')} onClick={() => navigate('/departamento')} />
          <NavItem icon="file" label="Oportunidades" active={en('/oportunidad')} onClick={() => navigate('/comercial')} />
          <NavItem icon="alert" label="Bloqueos" active={false} badge={bloqueosActivos} onClick={() => navigate('/departamento')} />
          <NavItem icon="sparkles" label="Asistente IA" active={en('/asistente')} onClick={() => navigate('/asistente')} />
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
