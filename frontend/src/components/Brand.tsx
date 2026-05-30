import logo from '../assets/logo.png'
import mascota from '../assets/mascota.png'
import { cn } from '../lib/ui'

/**
 * Logo de POD: identidad formal de marca. Se usa en chrome de aplicación
 * (sidebar, login, cabeceras), no en estados emocionales.
 */
export function Logo({ className }: { className?: string }) {
  return <img src={logo} alt="POD" className={cn('object-contain select-none', className)} draggable={false} />
}

/**
 * Mascota de POD (la taza con checklist): personalidad y momentos humanos.
 * Se usa en estados vacíos, onboarding, login y el asistente de IA.
 */
export function Mascota({ className }: { className?: string }) {
  return <img src={mascota} alt="" className={cn('object-contain select-none', className)} draggable={false} />
}

/** Estado vacío amistoso con la mascota. */
export function EmptyState({ titulo, children, className }: { titulo: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-8 px-4', className)}>
      <Mascota className="w-20 h-20 mb-3 opacity-90" />
      <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">{titulo}</p>
      {children && <p className="text-xs text-zinc-400 mt-1 max-w-xs">{children}</p>}
    </div>
  )
}
