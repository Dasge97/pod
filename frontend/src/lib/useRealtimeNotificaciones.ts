import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNotificacionesConfig } from '../api/hooks'
import { toast } from '../stores/toast'

/**
 * Suscribe el navegador al hub de Mercure (Server-Sent Events) para recibir
 * notificaciones en tiempo real. Al llegar una, refresca la lista y muestra un toast.
 */
export function useRealtimeNotificaciones() {
  const { data: config } = useNotificacionesConfig()
  const qc = useQueryClient()

  useEffect(() => {
    if (!config?.mercureUrl || !config?.topic) return

    let es: EventSource
    try {
      const url = new URL(config.mercureUrl)
      url.searchParams.append('topic', config.topic)
      es = new EventSource(url.toString())
    } catch {
      return
    }

    es.onmessage = (e) => {
      try {
        const n = JSON.parse(e.data)
        qc.invalidateQueries({ queryKey: ['notificaciones'] })
        toast.info(`${n.autor ? n.autor + ' ' : ''}${n.texto}`)
      } catch {
        // ignora payloads no-JSON
      }
    }

    return () => es.close()
  }, [config?.mercureUrl, config?.topic, qc])
}
