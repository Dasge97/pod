import { create } from 'zustand'

interface TareaModalState {
  tareaId: number | null
  abrir: (id: number) => void
  cerrar: () => void
}

/** Controla el modal de detalle de tarea de forma global (se abre desde cualquier fila de tarea). */
export const useTareaModal = create<TareaModalState>((set) => ({
  tareaId: null,
  abrir: (tareaId) => set({ tareaId }),
  cerrar: () => set({ tareaId: null }),
}))
