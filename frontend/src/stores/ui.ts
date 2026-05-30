import { create } from 'zustand'

export interface Crumb { label: string; to?: string }
export interface PageHeader { title?: string; sub?: string; crumbs?: Crumb[] }

interface UiState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  header: PageHeader
  setHeader: (h: PageHeader) => void
}

const inicial = (localStorage.getItem('pod_theme') as 'light' | 'dark') || 'light'
document.documentElement.classList.toggle('dark', inicial === 'dark')

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
}))
