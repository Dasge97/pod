import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { TareaDetalleModal } from './TareaDetalleModal'
import { CommandPalette } from './CommandPalette'
import { useAuth } from '../stores/auth'
import { useUi } from '../stores/ui'
import { useRealtimeNotificaciones } from '../lib/useRealtimeNotificaciones'
import { cn } from '../lib/ui'

export function Layout() {
  const { user, token } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useUi()
  useRealtimeNotificaciones()

  // Sin token no hay sesión; al login.
  if (!token) return <Navigate to="/login" replace />

  // Con token pero aún sin datos de usuario, esperamos a /me.
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-400 text-sm">
        Cargando…
      </div>
    )
  }

  const cerrarEnMovil = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Fondo oscuro al abrir el menú en pantallas pequeñas */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Menú lateral: estático en escritorio, superpuesto en móvil */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden',
        )}
      >
        <Sidebar onNavigate={cerrarEnMovil} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <TareaDetalleModal />
      <CommandPalette />
    </div>
  )
}
