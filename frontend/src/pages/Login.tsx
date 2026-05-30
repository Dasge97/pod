import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { Logo, Mascota } from '../components/Brand'
import { Icon } from '../components/Icon'

export function Login() {
  const navigate = useNavigate()
  const { login, cargando } = useAuth()
  const [email, setEmail] = useState('marta@pod.dev')
  const [password, setPassword] = useState('pod')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Credenciales incorrectas. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      {/* Panel de marca (mascota) */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/[0.08] dark:to-zinc-950 p-12">
        <Mascota className="w-48 h-48 mb-6 drop-shadow-xl" />
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 text-center">Tu departamento, de un vistazo.</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center max-w-sm">
          Proyectos, tareas, bloqueos y presupuestos en un único panel operativo. Entiende qué pasa en menos de 30 segundos.
        </p>
      </div>

      {/* Formulario (logo) */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <Logo className="h-10 w-auto" />
            <div className="leading-tight">
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">POD</div>
              <div className="text-[11px] text-zinc-400 -mt-0.5">Panel Operativo de Desarrollo</div>
            </div>
          </div>

          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Inicia sesión</h1>
          <p className="text-sm text-zinc-400 mt-1 mb-6">Accede al panel operativo del departamento.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[14px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[14px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition" />
            </div>

            {error && <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>}

            <button type="submit" disabled={cargando}
              className="w-full h-10 rounded-lg bg-emerald-500 text-white text-[14px] font-medium hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-60">
              {cargando ? 'Entrando…' : <>Entrar<Icon name="arrowLeft" className="w-4 h-4 rotate-180" /></>}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 px-3 py-2.5 text-[12px] text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">Demo:</span> marta@pod.dev · contraseña <span className="font-mono">pod</span>
          </div>
        </div>
      </div>
    </div>
  )
}
