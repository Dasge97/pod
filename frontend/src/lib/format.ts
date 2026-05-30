// Helpers de presentación. El backend envía datos crudos (ISO, números); aquí se formatean.

export function fmtEur(n: number): string {
  return new Intl.NumberFormat('es-ES').format(Math.round(n)) + ' €'
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** "2026-06-30" -> "30 jun" */
export function fmtFechaCorta(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

/** Tiempo relativo compacto: "hace 18 min", "hace 3 h", "hace 5 d". */
export function hace(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const seg = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seg < 60) return 'ahora'
  const min = Math.floor(seg / 60)
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const dias = Math.floor(h / 24)
  if (dias < 30) return `hace ${dias} d`
  const meses = Math.floor(dias / 30)
  return `hace ${meses} mes${meses > 1 ? 'es' : ''}`
}
