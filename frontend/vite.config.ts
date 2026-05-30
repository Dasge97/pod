import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El backend Symfony corre en :8000. Proxiamos /api para evitar CORS en desarrollo.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
