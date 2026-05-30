/* POD — Pantalla 3: Dashboard Comercial. Oportunidades abiertas y alertas. */

function OppRow({ o, go }) {
  const probTone = o.prob >= 70 ? "emerald" : o.prob >= 45 ? "amber" : "zinc";
  const alerta = (o.estado === "sin_respuesta" && o.diasEnvio > 14) || (o.prob >= 70 && o.ultSeguimiento > 10);
  return (
    <button onClick={() => go({ name: "oportunidad", id: o.id })}
      className="group w-full grid grid-cols-12 items-center gap-3 px-3 h-14 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition text-left">
      <div className="col-span-4 min-w-0 flex items-center gap-2.5">
        {alerta && <span title="Requiere atención" className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{o.cliente}</div>
          <div className="text-[11px] text-zinc-400 truncate">{o.titulo}</div>
        </div>
      </div>
      <div className="col-span-2 font-mono text-[13px] font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{POD.fmtEur(o.importe)}</div>
      <div className="col-span-2"><OppBadge estado={o.estado} /></div>
      <div className="col-span-2 flex items-center gap-2">
        <Progress value={o.prob} tone={probTone} className="flex-1" />
        <span className="font-mono text-[11px] tabular-nums text-zinc-400 w-8 text-right">{o.prob}%</span>
      </div>
      <div className={"col-span-1 text-[11px] font-medium text-right " + (o.diasEnvio > 21 ? "text-red-600 dark:text-red-400" : o.diasEnvio > 14 ? "text-amber-600 dark:text-amber-400" : "text-zinc-400")}>{o.diasEnvio} d</div>
      <div className="col-span-1 flex justify-end"><Avatar id={o.responsable} size="sm" /></div>
    </button>
  );
}

function AlertaCard({ tone, titulo, oportunidad, meta, go }) {
  const t = TONES[tone];
  return (
    <button onClick={go} className={"w-full text-left rounded-lg border p-3 transition " +
      (tone === "red" ? "border-red-200/70 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/[0.07] hover:border-red-300"
                      : "border-amber-200/70 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.07] hover:border-amber-300")}>
      <div className="flex items-start gap-2.5">
        <span className={"mt-0.5 w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ring-1 ring-inset " + t.soft}><Icon name="clock" className="w-4 h-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{titulo}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{oportunidad}</p>
        </div>
        <span className={"text-[11px] font-semibold shrink-0 " + t.text}>{meta}</span>
      </div>
    </button>
  );
}

function ComercialScreen({ go }) {
  const O = POD.oportunidades;
  const abiertas = O.filter(o => o.estado !== "aceptado" && o.estado !== "rechazado");
  const pipeline = abiertas.reduce((s, o) => s + o.importe, 0);
  const ponderado = Math.round(abiertas.reduce((s, o) => s + o.importe * o.prob / 100, 0));
  const ganado = O.filter(o => o.estado === "aceptado").reduce((s, o) => s + o.importe, 0);

  const sinRespuesta = abiertas.filter(o => o.estado === "sin_respuesta" && o.diasEnvio > 14);
  const sinSeguimiento = abiertas.filter(o => o.ultSeguimiento > 14 && o.estado !== "sin_respuesta");
  const altaProbInactiva = abiertas.filter(o => o.prob >= 70 && o.ultSeguimiento > 10);

  const embudo = ["enviado", "negociacion", "sin_respuesta", "borrador"].map(e => ({
    estado: e, label: OPP_ESTADO[e].label, tone: OPP_ESTADO[e].tone,
    n: abiertas.filter(o => o.estado === e).length,
    importe: abiertas.filter(o => o.estado === e).reduce((s, o) => s + o.importe, 0),
  }));

  const ordenadas = abiertas.slice().sort((a, b) => b.importe - a.importe);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon="trending" label="Pipeline activo"     value={POD.fmtEur(pipeline)} sub={abiertas.length + " oportunidades"} tone="blue" />
        <Kpi icon="filter"   label="Pipeline ponderado"  value={POD.fmtEur(ponderado)} sub="por probabilidad" tone="violet" />
        <Kpi icon="check"    label="Ganado"              value={POD.fmtEur(ganado)} sub="este trim." tone="emerald" />
        <Kpi icon="alert"    label="Alertas"             value={sinRespuesta.length + sinSeguimiento.length + altaProbInactiva.length} sub="requieren acción" tone="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card title="Oportunidades abiertas" pad={false}
            action={<button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition"><Icon name="plus" className="w-3.5 h-3.5" />Nueva</button>}>
            <div className="px-2 py-1.5">
              <div className="grid grid-cols-12 gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span className="col-span-4">Cliente / oportunidad</span><span className="col-span-2">Importe</span><span className="col-span-2">Estado</span>
                <span className="col-span-2">Probabilidad</span><span className="col-span-1 text-right">Envío</span><span className="col-span-1 text-right">Resp.</span>
              </div>
              {ordenadas.map(o => <OppRow key={o.id} o={o} go={go} />)}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Alertas comerciales"
            action={<span className="font-mono text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-300 px-1.5 rounded">{sinRespuesta.length + sinSeguimiento.length + altaProbInactiva.length}</span>}>
            <div className="space-y-2.5">
              {sinRespuesta.map(o => <AlertaCard key={"sr"+o.id} tone="red" titulo="Sin respuesta del cliente" oportunidad={o.cliente + " · " + POD.fmtEur(o.importe)} meta={o.diasEnvio + " d"} go={() => go({ name: "oportunidad", id: o.id })} />)}
              {altaProbInactiva.map(o => <AlertaCard key={"ap"+o.id} tone="amber" titulo="Alta probabilidad sin seguimiento" oportunidad={o.cliente + " · " + o.prob + "% prob."} meta={o.ultSeguimiento + " d"} go={() => go({ name: "oportunidad", id: o.id })} />)}
              {sinSeguimiento.map(o => <AlertaCard key={"ss"+o.id} tone="amber" titulo="Sin seguimiento reciente" oportunidad={o.cliente + " · " + POD.fmtEur(o.importe)} meta={o.ultSeguimiento + " d"} go={() => go({ name: "oportunidad", id: o.id })} />)}
            </div>
          </Card>

          <Card title="Embudo" pad={false}>
            <div className="px-2 py-2 space-y-0.5">
              {embudo.map(e => (
                <div key={e.estado} className="flex items-center gap-3 px-3 h-11">
                  <span className={"w-2 h-2 rounded-full " + TONES[e.tone].dot} />
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-200 flex-1">{e.label}</span>
                  <span className="font-mono text-[11px] text-zinc-400 tabular-nums">{e.n}</span>
                  <span className="font-mono text-[12px] font-medium text-zinc-900 dark:text-zinc-100 tabular-nums w-24 text-right">{POD.fmtEur(e.importe)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ComercialScreen });
