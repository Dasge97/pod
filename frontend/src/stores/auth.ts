import { create } from 'zustand'
import { api, setToken, getToken } from '../api/client'
import type { Usuario } from '../types'

interface AuthState {
  user: Usuario | null
  token: string | null
  cargando: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  cargarSesion: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: getToken(),
  cargando: false,

  async login(email, password) {
    set({ cargando: true })
    try {
      const { data } = await api.post('/login', { email, password })
      setToken(data.token)
      const me = await api.get('/me')
      set({ user: me.data, token: data.token, cargando: false })
    } catch (e) {
      set({ cargando: false })
      throw e
    }
  },

  logout() {
    setToken(null)
    set({ user: null, token: null })
  },

  async cargarSesion() {
    if (!getToken()) return
    try {
      const me = await api.get('/me')
      set({ user: me.data, token: getToken() })
    } catch {
      setToken(null)
      set({ user: null, token: null })
    }
  },
}))
