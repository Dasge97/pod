import { create } from 'zustand'

interface CommandState {
  open: boolean
  abrir: () => void
  cerrar: () => void
  toggle: () => void
}

export const useCommand = create<CommandState>((set) => ({
  open: false,
  abrir: () => set({ open: true }),
  cerrar: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
}))
