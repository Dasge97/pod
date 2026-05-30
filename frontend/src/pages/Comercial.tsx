import { useNavigate } from 'react-router-dom'
import { useDashboardSales } from '../api/hooks'
import { useHeader } from '../lib/useHeader'
import { useAuth } from '../stores/auth'
import { esComercial } from '../lib/permisos'
import { Card, Kpi } from '../components/ui'
import { OppRow } from '../components/rows'
import { Icon } from '../components/Icon'
import { cn, TONES, OPP_ESTADO_TONE, type Tone } from '../lib/ui'
import { fmtEur } from '../lib/format'
import { Cargando } from './Personal'

function AlertaCard({ tone, titulo, sub, meta, onClick }: { tone: Tone; titulo: string; sub: string; meta: string; onClick: () => void }) {
  const t = TONES[tone]
  return (
    <button onClick={onClick} className={cn('w-full text-left rounded-lg border p-3 transition', tone === 'red' ? 'border-red-200/70 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/[0.07] hover:border-red-300' : 'border-amber-200/70 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.07] hover:border-amber-300')}>
      <div className="flex items-start gap-2.5">
        <span className={cn('mt-0.5 w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ring-1 ring-inset', t.soft)}><Icon name="clock" className="w-4 h-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{titulo}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{sub}</p>
        </div>
        <span className={cn('text-[11px] font-semibold shrink-0', t.text)}>{meta}</span>
      </div>
    </button>
  )
}

export function Comercial() {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboardSales()
  const { user } = useAuth()
  const puedeComercial = esComercial(user)
  useHeader({ title: 'Comercial', sub: 'Presupuestos y oportunidades abiertas' }, [])

  if (isLoading || !data) return <Cargando />

  const { kpis, oportunidades, alertas, embudo } = data

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon="trending" label="Pipeline activo" value={fmtEur(kpis.pipeline)} sub={`${oportunidades.length} oportunidades`} tone="blue" />
        <Kpi icon="filter" label="Pipeline ponderado" value={fmtEur(kpis.ponderado)} sub="por probabilidad" tone="violet" />
        <Kpi icon="check" label="Ganado" value={fmtEur(kpis.ganado)} sub="este trim." tone="emerald" />
        <Kpi icon="alert" label="Alertas" value={kpis.alertas} sub="requieren acción" tone="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card title="Oportunidades abiertas" pad={false} action={puedeComercial && <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition"><Icon name="plus" className="w-3.5 h-3.5" />Nueva</button>}>
            <div className="px-2 py-1.5">
              <div className="grid grid-cols-12 gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span className="col-span-4">Cliente / oportunidad</span><span className="col-span-2">Importe</span><span className="col-span-2">Estado</span>
                <span className="col-span-2">Probabilidad</span><span className="col-span-1 text-right">Envío</span><span className="col-span-1 text-right">Resp.</span>
              </div>
              {oportunidades.map((o) => <OppRow key={o.id} o={o} />)}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Alertas comerciales" action={<span className="font-mono text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-300 px-1.5 rounded">{kpis.alertas}</span>}>
            <div className="space-y-2.5">
              {alertas.sinRespuesta.map((o) => <AlertaCard key={'sr' + o.id} tone="red" titulo="Sin respuesta del cliente" sub={`${o.cliente} · ${fmtEur(o.importe)}`} meta={`${o.diasEnvio} d`} onClick={() => navigate(`/oportunidad/${o.id}`)} />)}
              {alertas.altaProbInactiva.map((o) => <AlertaCard key={'ap' + o.id} tone="amber" titulo="Alta probabilidad sin seguimiento" sub={`${o.cliente} · ${o.probabilidad}% prob.`} meta={`${o.diasSinSeguimiento} d`} onClick={() => navigate(`/oportunidad/${o.id}`)} />)}
              {alertas.sinSeguimiento.map((o) => <AlertaCard key={'ss' + o.id} tone="amber" titulo="Sin seguimiento reciente" sub={`${o.cliente} · ${fmtEur(o.importe)}`} meta={`${o.diasSinSeguimiento} d`} onClick={() => navigate(`/oportunidad/${o.id}`)} />)}
              {kpis.alertas === 0 && <p className="py-4 text-sm text-zinc-400 text-center">Sin alertas comerciales.</p>}
            </div>
          </Card>

          <Card title="Embudo" pad={false}>
            <div className="px-2 py-2 space-y-0.5">
              {embudo.map((e) => (
                <div key={e.estado} className="flex items-center gap-3 px-3 h-11">
                  <span className={cn('w-2 h-2 rounded-full', TONES[OPP_ESTADO_TONE[e.estado]].dot)} />
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-200 flex-1">{e.label}</span>
                  <span className="font-mono text-[11px] text-zinc-400 tabular-nums">{e.n}</span>
                  <span className="font-mono text-[12px] font-medium text-zinc-900 dark:text-zinc-100 tabular-nums w-24 text-right">{fmtEur(e.importe)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
