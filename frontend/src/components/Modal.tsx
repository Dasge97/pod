import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <Icon name="blocked" className="w-4 h-4" />
          </button>
        </header>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <footer className="flex justify-end gap-2 px-5 h-14 items-center border-t border-zinc-100 dark:border-zinc-800 shrink-0">{footer}</footer>}
      </div>
    </div>
  )
}

export const fieldCls = 'w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[13px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
