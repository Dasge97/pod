import { useState } from 'react'
import { useOportunidades } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { useAuth } from '../stores/auth'
import { esComercial } from '../lib/permisos'
import { Card, Kpi } from '../components/ui'
import { OppRow } from '../components/rows'
import { OportunidadModal } from '../components/OportunidadModal'
import { Icon } from '../components/Icon'
import { cn } from '../lib/ui'
import { fmtEur } from '../lib/format'
import { Cargando } from './Personal'

export function Oportunidades() {
  const [filtro, setFiltro] = useState('abiertas')
  const [modalOpen, setModalOpen] = useState(false)
  const { data: oportunidades, isLoading } = useOportunidades()
  const { user } = useAuth()
  const puedeComercial = esComercial(user)
  useHeader({ title: 'Oportunidades', sub: 'Presupuestos enviados y su seguimiento' }, [])

  if (isLoading || !oportunidades) return <Cargando />

  const abierta = (e: string) => e !== 'aceptado' && e !== 'rechazado'
  const pipeline = oportunidades.filter((o) => abierta(o.estado)).reduce((s, o) => s + o.importe, 0)
  const ganado = oportunidades.filter((o) => o.estado === 'aceptado').reduce((s, o) => s + o.importe, 0)

  const filtros = [
    { id: 'abiertas', label: 'Abiertas', n: oportunidades.filter((o) => abierta(o.estado)).length },
    { id: 'todas', label: 'Todas', n: oportunidades.length },
    { id: 'negociacion', label: 'En negociación', n: oportunidades.filter((o) => o.estado === 'negociacion').length },
    { id: 'enviado', label: 'Enviadas', n: oportunidades.filter((o) => o.estado === 'enviado').length },
    { id: 'sin_respuesta', label: 'Sin respuesta', n: oportunidades.filter((o) => o.estado === 'sin_respuesta').length },
    { id: 'aceptado', label: 'Aceptadas', n: oportunidades.filter((o) => o.estado === 'aceptado').length },
  ]
  let lista = oportunidades
  if (filtro === 'abiertas') lista = oportunidades.filter((o) => abierta(o.estado))
  else if (filtro !== 'todas') lista = oportunidades.filter((o) => o.estado === filtro)
  lista = [...lista].sort((a, b) => b.importe - a.importe)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi icon="trending" label="Pipeline abierto" value={fmtEur(pipeline)} sub={`${oportunidades.filter((o) => abierta(o.estado)).length} oportunidades`} tone="blue" />
        <Kpi icon="check" label="Ganado" value={fmtEur(ganado)} sub="aceptadas" tone="emerald" />
        <Kpi icon="file" label="Total" value={oportunidades.length} sub="presupuestos" tone="zinc" />
      </div>

      <Card title="Oportunidades" pad={false} action={
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-1 flex-wrap">
            {filtros.map((f) => (
              <button key={f.id} onClick={() => setFiltro(f.id)}
                className={cn('px-2 h-7 rounded-md text-xs font-medium transition flex items-center gap-1.5', filtro === f.id ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800')}>
                {f.label}<span className={cn('font-mono', filtro === f.id ? 'opacity-70' : 'text-zinc-400')}>{f.n}</span>
              </button>
            ))}
          </div>
          {puedeComercial && <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition"><Icon name="plus" className="w-3.5 h-3.5" />Nueva</button>}
        </div>
      }>
        <div className="px-2 py-1.5">
          <div className="grid grid-cols-12 gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <span className="col-span-4">Cliente / oportunidad</span><span className="col-span-2">Importe</span><span className="col-span-2">Estado</span>
            <span className="col-span-2">Probabilidad</span><span className="col-span-1 text-right">Envío</span><span className="col-span-1 text-right">Resp.</span>
          </div>
          {lista.map((o) => <OppRow key={o.id} o={o} />)}
          {lista.length === 0 && <p className="px-3 py-10 text-sm text-zinc-400 text-center">No hay oportunidades en este filtro.</p>}
        </div>
      </Card>

      <OportunidadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
