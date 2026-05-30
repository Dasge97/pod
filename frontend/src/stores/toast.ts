import { create } from 'zustand'

export type ToastTipo = 'error' | 'success' | 'info'
export interface Toast { id: number; tipo: ToastTipo; mensaje: string }

interface ToastState {
  toasts: Toast[]
  push: (tipo: ToastTipo, mensaje: string) => void
  remove: (id: number) => void
}

let nextId = 1

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (tipo, mensaje) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, tipo, mensaje }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Helper para usar desde fuera de React (interceptores, etc.). */
export const toast = {
  error: (m: string) => useToast.getState().push('error', m),
  success: (m: string) => useToast.getState().push('success', m),
  info: (m: string) => useToast.getState().push('info', m),
}
