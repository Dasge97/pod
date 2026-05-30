import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAuth } from '../stores/auth'

export function Layout() {
  const { user, token } = useAuth()

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

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
