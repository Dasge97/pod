/* POD — Pantalla 2: Dashboard Departamental. Visión global, riesgos, carga. */

function RiesgoRow({ icon, tone, texto, detalle, meta, go, route }) {
  const t = TONES[tone];
  return (
    <button onClick={go} className="w-full flex items-center gap-3 px-3 h-14 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition text-left">
      <span className={"w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ring-1 ring-inset " + t.soft}><Icon name={icon} className="w-4 h-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{texto}</div>
        <div className="text-[11px] text-zinc-400 truncate">{detalle}</div>
      </div>
      <span className={"text-[11px] font-medium shrink-0 " + t.text}>{meta}</span>
    </button>
  );
}

function UsuarioCargaRow({ u }) {
  return (
    <div className="flex items-center gap-3 px-3 h-12">
      <Avatar id={u.id} size="md" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{u.nombre}</div>
        <div className="text-[11px] text-zinc-400 truncate">{u.proyectos} proyectos · {u.tareas} tareas abiertas</div>
      </div>
      <CargaBar value={u.carga} />
    </div>
  );
}

function DepartamentoScreen({ go }) {
  const [filtro, setFiltro] = React.useState("todos");

  const P = POD.proyectos;
  const activos = P.filter(p => p.estado !== "finalizado");
  const bloqueados = P.filter(p => p.estado === "bloqueado");
  const retrasados = P.filter(p => p.retrasado);
  const finalizados = P.filter(p => p.estado === "finalizado");
  const enRevision = P.filter(p => p.estado === "revision");
  const tareasVencidas = POD.tareas.filter(t => t.vencida);

  // Riesgos
  const sinActividad = P.filter(p => p.sinActividad >= 7 && p.estado !== "finalizado");
  const conBloqueos = P.filter(p => POD.bloqueos.some(b => b.proyecto === p.id && b.estado === "activo"));
  const conVencidas = P.filter(p => POD.tareas.some(t => t.proyecto === p.id && t.vencida));

  const filtros = [
    { id: "todos", label: "Todos", n: P.length },
    { id: "activos", label: "Activos", n: activos.length },
    { id: "bloqueado", label: "Bloqueados", n: bloqueados.length },
    { id: "retrasados", label: "Retrasados", n: retrasados.length },
    { id: "revision", label: "En revisión", n: enRevision.length },
    { id: "finalizado", label: "Finalizados", n: finalizados.length },
  ];
  let lista = P;
  if (filtro === "activos") lista = activos;
  else if (filtro === "retrasados") lista = retrasados;
  else if (filtro !== "todos") lista = P.filter(p => p.estado === filtro);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi icon="folder"   label="Activos"     value={activos.length}     sub={"de " + P.length} tone="blue" onClick={() => setFiltro("activos")} />
        <Kpi icon="blocked"  label="Bloqueados"  value={bloqueados.length}  sub="ahora" tone="red" onClick={() => setFiltro("bloqueado")} />
        <Kpi icon="clock"    label="Retrasados"  value={retrasados.length}  sub="sobre plan" tone="amber" onClick={() => setFiltro("retrasados")} />
        <Kpi icon="flag"     label="En revisión" value={enRevision.length}  sub="por cerrar" tone="violet" onClick={() => setFiltro("revision")} />
        <Kpi icon="check"    label="Finalizados" value={finalizados.length} sub="este trim." tone="emerald" onClick={() => setFiltro("finalizado")} />
        <Kpi icon="alert"    label="Tareas vencidas" value={tareasVencidas.length} sub="en activo" tone="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Riesgos */}
          <Card title="Requiere atención" pad={false}
            action={<span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{sinActividad.length + conBloqueos.length + conVencidas.length} señales</span>}>
            <div className="px-2 py-1.5 divide-y divide-zinc-100 dark:divide-zinc-800">
              {conBloqueos.map(p => {
                const b = POD.bloqueos.filter(x => x.proyecto === p.id && x.estado === "activo");
                return <RiesgoRow key={"bl"+p.id} icon="blocked" tone="red" texto={p.nombre}
                  detalle={b.length + " bloqueo" + (b.length>1?"s":"") + " abierto" + (b.length>1?"s":"") + " · " + p.cliente}
                  meta={"hace " + Math.max.apply(null, b.map(x=>x.dias)) + " d"} go={() => go({ name: "proyecto", id: p.id })} />;
              })}
              {sinActividad.map(p =>
                <RiesgoRow key={"sa"+p.id} icon="clock" tone="amber" texto={p.nombre}
                  detalle={"Sin actividad · " + p.cliente} meta={p.sinActividad + " días"} go={() => go({ name: "proyecto", id: p.id })} />
              )}
              {conVencidas.filter(p => !conBloqueos.includes(p)).map(p => {
                const v = POD.tareas.filter(t => t.proyecto === p.id && t.vencida).length;
                return <RiesgoRow key={"cv"+p.id} icon="alert" tone="amber" texto={p.nombre}
                  detalle={v + " tarea" + (v>1?"s":"") + " vencida" + (v>1?"s":"") + " · " + p.cliente} meta="revisar" go={() => go({ name: "proyecto", id: p.id })} />;
              })}
            </div>
          </Card>

          {/* Proyectos */}
          <Card title="Proyectos del departamento" pad={false}
            action={
              <div className="flex items-center gap-1">
                {filtros.map(f =>
                  <button key={f.id} onClick={() => setFiltro(f.id)}
                    className={"px-2 h-7 rounded-md text-xs font-medium transition flex items-center gap-1.5 " +
                      (filtro === f.id ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>
                    {f.label}<span className={"font-mono " + (filtro === f.id ? "opacity-70" : "text-zinc-400")}>{f.n}</span>
                  </button>
                )}
              </div>
            }>
            <div className="px-2 py-1.5">
              <div className="grid grid-cols-12 gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span className="col-span-5">Proyecto</span><span className="col-span-2">Estado</span>
                <span className="col-span-3">Progreso</span><span className="col-span-1 text-center">Pend.</span><span className="col-span-1 text-right">Resp.</span>
              </div>
              {lista.map(p => <ProyectoRow key={p.id} p={p} go={go} />)}
              {lista.length === 0 && <p className="px-3 py-6 text-sm text-zinc-400 text-center">Ningún proyecto en este filtro.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Carga del equipo" pad={false}
            action={<span className="text-xs text-zinc-400">{POD.users.filter(u=>u.carga>=90).length} sobrecargados</span>}>
            <div className="px-1 py-1.5">
              {POD.users.slice().sort((a,b)=>b.carga-a.carga).map(u => <UsuarioCargaRow key={u.id} u={u} />)}
            </div>
          </Card>

          <Card title="Actividad del departamento" pad={false}>
            <ul className="px-4 py-1 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[420px] overflow-y-auto">
              {POD.actividad.map(a => <ActivityItem key={a.id} act={a} />)}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DepartamentoScreen });
