import { useBloqueos } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { Card, Kpi } from '../components/ui'
import { BloqueoCard } from '../components/rows'
import { EmptyState } from '../components/Brand'
import { Cargando } from './Personal'

export function Bloqueos() {
  const { data: bloqueos, isLoading } = useBloqueos()
  useHeader({ title: 'Bloqueos', sub: 'Impedimentos activos en el departamento' }, [])

  if (isLoading || !bloqueos) return <Cargando />

  const criticos = bloqueos.filter((b) => b.severidad === 'critica').length
  const antiguos = bloqueos.filter((b) => b.diasAbierto >= 5).length

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi icon="blocked" label="Bloqueos activos" value={bloqueos.length} sub="ahora mismo" tone={bloqueos.length ? 'red' : 'emerald'} />
        <Kpi icon="alert" label="Críticos" value={criticos} sub="máxima severidad" tone={criticos ? 'red' : 'emerald'} />
        <Kpi icon="clock" label="Estancados" value={antiguos} sub="≥ 5 días abiertos" tone={antiguos ? 'amber' : 'emerald'} />
      </div>

      <Card title="Bloqueos activos" pad={bloqueos.length === 0} action={bloqueos.length > 0 && <span className="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-500/15 px-1.5 rounded">{bloqueos.length}</span>}>
        {bloqueos.length === 0 ? (
          <EmptyState titulo="Ningún bloqueo activo. Todo fluye.">El equipo no tiene impedimentos abiertos ahora mismo.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3">
            {bloqueos.map((b) => <BloqueoCard key={b.id} b={b} />)}
          </div>
        )}
      </Card>
    </div>
  )
}
