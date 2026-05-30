import { useEffect } from 'react'
import { useUi, type PageHeader } from '../stores/ui'

/** Establece la cabecera (título/breadcrumbs) de la Topbar para la página actual. */
export function useHeader(header: PageHeader, deps: unknown[] = []) {
  const setHeader = useUi((s) => s.setHeader)
  useEffect(() => {
    setHeader(header)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
