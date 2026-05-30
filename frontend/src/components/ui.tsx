import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { cn, TONES, type Tone, PROYECTO_ESTADO_TONE, TAREA_ESTADO_TONE, PRIORIDAD_TONE, OPP_ESTADO_TONE, ACT_ICON, ACT_TONE, cargaTone } from '../lib/ui'
import { hace } from '../lib/format'
import type { Usuario, Actividad } from '../types'

/* ---------- Badge ---------- */
export function Badge({ tone = 'zinc', children, dot = true, className = '' }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  const t = TONES[tone] || TONES.zinc
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', t.soft, className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  )
}

export const EstadoBadge = ({ estado, label }: { estado: string; label: string }) => <Badge tone={PROYECTO_ESTADO_TONE[estado] || 'zinc'}>{label}</Badge>
export const TareaBadge = ({ estado, label }: { estado: string; label: string }) => <Badge tone={TAREA_ESTADO_TONE[estado] || 'zinc'}>{label}</Badge>
export const OppBadge = ({ estado, label }: { estado: string; label: string }) => <Badge tone={OPP_ESTADO_TONE[estado] || 'zinc'}>{label}</Badge>

export function PrioridadBadge({ prioridad, label }: { prioridad: string; label: string }) {
  const tone = PRIORIDAD_TONE[prioridad] || 'zinc'
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', TONES[tone].text)}>
      <Icon name="flag" className="w-3 h-3" />
      {label}
    </span>
  )
}

/* ---------- Avatar ---------- */
export function Avatar({ user, size = 'md' }: { user?: Usuario | null; size?: 'sm' | 'md' | 'lg' }) {
  if (!user) return null
  const s = size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'lg' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'
  return (
    <span title={user.nombre} className={cn('inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0', user.color, s)}>
      {user.iniciales}
    </span>
  )
}

export function AvatarStack({ users, max = 4 }: { users: Usuario[]; max?: number }) {
  const shown = users.slice(0, max)
  const extra = users.length - shown.length
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((u) => (
          <span key={u.id} className="ring-2 ring-white dark:ring-zinc-900 rounded-full">
            <Avatar user={u} size="sm" />
          </span>
        ))}
      </div>
      {extra > 0 && <span className="ml-1 text-xs text-zinc-400">+{extra}</span>}
    </div>
  )
}

/* ---------- Progreso ---------- */
export function Progress({ value, tone = 'emerald', className = '' }: { value: number; tone?: Tone; className?: string }) {
  const t = TONES[tone] || TONES.emerald
  return (
    <div className={cn('h-1.5 rounded-full bg-zinc-150 dark:bg-zinc-800 overflow-hidden', className)}>
      <div className={cn('h-full rounded-full', t.bar)} style={{ width: Math.max(2, value) + '%' }} />
    </div>
  )
}

/* ---------- KPI ---------- */
export function Kpi({ icon, label, value, sub, tone = 'zinc', onClick }: { icon?: string; label: string; value: ReactNode; sub?: ReactNode; tone?: Tone; onClick?: () => void }) {
  const t = TONES[tone] || TONES.zinc
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn('text-left rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition', onClick ? 'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm cursor-pointer' : 'cursor-default')}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-zinc-500 dark:text-zinc-400">{label}</span>
        {icon && (
          <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center ring-1 ring-inset', t.soft)}>
            <Icon name={icon} className="w-4 h-4" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</span>
        {sub && <span className="text-xs text-zinc-400">{sub}</span>}
      </div>
    </button>
  )
}

/* ---------- Card ---------- */
export function Card({ title, action, children, pad = true, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; pad?: boolean; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between px-4 h-12 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
          {action}
        </header>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  )
}

/* ---------- Item de actividad ---------- */
export function ActivityItem({ act, showProyecto = true }: { act: Actividad; showProyecto?: boolean }) {
  const tone = ACT_TONE[act.familia] || 'zinc'
  const t = TONES[tone]
  return (
    <li className="flex gap-3 py-2.5">
      <span className={cn('mt-0.5 w-7 h-7 shrink-0 rounded-full flex items-center justify-center ring-1 ring-inset', t.soft)}>
        <Icon name={ACT_ICON[act.familia] || 'dot'} className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{act.usuario?.nombre ?? '—'}</span> {act.texto}{' '}
          {act.objeto && <span className="font-medium text-zinc-800 dark:text-zinc-200">{act.objeto}</span>}
          {showProyecto && act.proyecto && <span className="text-zinc-400"> · {act.proyecto.nombre}</span>}
        </p>
        <span className="text-xs text-zinc-400">{hace(act.fecha)}</span>
      </div>
    </li>
  )
}

/* ---------- Barra de carga ---------- */
export function CargaBar({ value }: { value: number }) {
  const tone = cargaTone(value)
  return (
    <div className="flex items-center gap-2 w-32">
      <Progress value={value} tone={tone} className="flex-1" />
      <span className={cn('font-mono text-xs tabular-nums', TONES[tone].text)}>{value}%</span>
    </div>
  )
}
