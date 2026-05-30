import axios from 'axios'
import { toast } from '../stores/toast'

// Cliente HTTP único. El token se inyecta desde el store de sesión.
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

let token: string | null = localStorage.getItem('pod_token')

export function setToken(t: string | null) {
  token = t
  if (t) localStorage.setItem('pod_token', t)
  else localStorage.removeItem('pod_token')
}

export function getToken() {
  return token
}

api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Ante un 401, limpiamos la sesión y mandamos al login.
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error.response?.status
    if (status === 401 && token) {
      setToken(null)
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login'
      }
    } else if (status && status >= 400 && error.config?.method !== 'get') {
      // Errores de acciones (no de lecturas) se muestran como toast.
      const msg = error.response?.data?.error || 'No se pudo completar la acción.'
      toast.error(msg)
    }
    return Promise.reject(error)
  },
)
