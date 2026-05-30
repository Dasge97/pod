import { create } from 'zustand'

export interface Crumb { label: string; to?: string }
export interface PageHeader { title?: string; sub?: string; crumbs?: Crumb[] }

interface UiState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  header: PageHeader
  setHeader: (h: PageHeader) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

const inicial = (localStorage.getItem('pod_theme') as 'light' | 'dark') || 'light'
document.documentElement.classList.toggle('dark', inicial === 'dark')

// Abierto por defecto en escritorio, oculto en pantallas pequeñas.
const sidebarInicial = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true

export const useUi = create<UiState>((set) => ({
  theme: inicial,
  toggleTheme: () =>
    set((s) => {
      const theme = s.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('pod_theme', theme)
      return { theme }
    }),
  header: {},
  setHeader: (header) => set({ header }),
  sidebarOpen: sidebarInicial,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
