/* POD — Pantalla 1: Dashboard Personal. También define filas reutilizables. */

/* ---------- Filas reutilizables ---------- */
function ProyectoRow({ p, go, compact }) {
  const resp = POD.user(p.responsable);
  const barTone = p.estado === "bloqueado" ? "red" : p.estado === "finalizado" ? "emerald" : p.estado === "revision" ? "violet" : "blue";
  return (
    <button onClick={() => go({ name: "proyecto", id: p.id })}
      className="group w-full grid grid-cols-12 items-center gap-3 px-3 h-14 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition text-left">
      <div className="col-span-5 min-w-0 flex items-center gap-2.5">
        {p.retrasado && <span title="Retrasado" className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{p.nombre}</div>
          <div className="text-[11px] text-zinc-400 truncate">{p.cliente}</div>
        </div>
      </div>
      <div className="col-span-2"><EstadoBadge estado={p.estado} /></div>
      <div className="col-span-3 flex items-center gap-2">
        <Progress value={p.progreso} tone={barTone} className="flex-1" />
        <span className="font-mono text-[11px] tabular-nums text-zinc-400 w-8 text-right">{p.progreso}%</span>
      </div>
      <div className="col-span-1 font-mono text-xs tabular-nums text-zinc-500 text-center">{p.tareasPend}</div>
      <div className="col-span-1 flex justify-end"><Avatar id={resp.id} size="sm" /></div>
    </button>
  );
}

function TareaRow({ t, go, showProyecto = true }) {
  const proy = POD.byId(POD.proyectos, t.proyecto);
  const over = t.hechas > t.est;
  return (
    <button onClick={() => go({ name: "proyecto", id: t.proyecto })}
      className="group w-full flex items-center gap-3 px-3 h-12 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition text-left">
      <span className="shrink-0"><PrioridadBadge prioridad={t.prioridad} /></span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{t.titulo}</div>
        {showProyecto && <div className="text-[11px] text-zinc-400 truncate">{proy.nombre}</div>}
      </div>
      <span className="hidden lg:block"><TareaBadge estado={t.estado} /></span>
      <span className={"font-mono text-[11px] tabular-nums shrink-0 w-16 text-right " + (over ? "text-amber-600 dark:text-amber-400" : "text-zinc-400")}>{t.hechas}/{t.est} h</span>
      <span className={"flex items-center gap-1 shrink-0 w-20 justify-end text-[11px] font-medium " + (t.vencida ? "text-red-600 dark:text-red-400" : "text-zinc-400")}>
        <Icon name="clock" className="w-3 h-3" />{t.limite}
      </span>
      <Avatar id={t.asignado} size="sm" />
    </button>
  );
}

function BloqueoCard({ b, go }) {
  const proy = POD.byId(POD.proyectos, b.proyecto);
  const tone = b.severidad === "critica" ? "red" : b.severidad === "alta" ? "red" : "amber";
  return (
    <button onClick={() => go({ name: "proyecto", id: b.proyecto })}
      className="w-full text-left rounded-lg border border-red-200/70 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/[0.07] p-3 hover:border-red-300 dark:hover:border-red-500/40 transition">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center"><Icon name="alert" className="w-4 h-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge tone={tone} dot={false} className="capitalize">{b.severidad}</Badge>
            <span className="text-[11px] text-zinc-400">{b.fecha}</span>
          </div>
          <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{b.titulo}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{proy.nombre} · abierto por {POD.user(b.creadoPor).nombre}</p>
        </div>
      </div>
    </button>
  );
}

/* ---------- Pantalla Personal ---------- */
function PersonalScreen({ go }) {
  const me = POD.currentUser;
  const misParticipa = Object.keys(POD.participantes).filter(function (pid) {
    return POD.participantes[pid].some(function (x) { return x.u === me; });
  });
  const misProyectos = POD.proyectos.filter(function (p) { return misParticipa.indexOf(p.id) >= 0; });
  const activos = misProyectos.filter(function (p) { return p.estado !== "finalizado"; });
  const prioOrder = { critica: 0, alta: 1, media: 2, baja: 3 };
  const misTareas = POD.tareas.filter(function (t) { return t.asignado === me && t.estado !== "finalizada"; })
    .sort(function (a, b) { return prioOrder[a.prioridad] - prioOrder[b.prioridad]; });
  const misBloqueos = POD.bloqueos.filter(function (b) { return b.estado === "activo" && misParticipa.indexOf(b.proyecto) >= 0; });
  const miActividad = POD.actividad.filter(function (a) { return !a.proyecto || misParticipa.indexOf(a.proyecto) >= 0; }).slice(0, 6);
  const progresoMedio = Math.round(activos.reduce(function (s, p) { return s + p.progreso; }, 0) / activos.length);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Buenos días, Marta</h2>
        <p className="text-sm text-zinc-400">Esto es lo que necesita tu atención hoy.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon="folder"   label="Proyectos activos"  value={activos.length} sub={"de " + misProyectos.length} tone="blue" onClick={() => go({ name: "departamento" })} />
        <Kpi icon="checkbox" label="Tareas pendientes"  value={misTareas.length} sub={misTareas.filter(t=>t.vencida).length + " vencidas"} tone="violet" />
        <Kpi icon="alert"    label="Bloqueos activos"   value={misBloqueos.length} sub="requieren acción" tone={misBloqueos.length ? "red" : "emerald"} />
        <Kpi icon="trending" label="Progreso medio"     value={progresoMedio + "%"} sub="mis proyectos" tone="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card title="Mis proyectos" pad={false}
            action={<button onClick={() => go({ name: "departamento" })} className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Ver todos</button>}>
            <div className="px-2 py-1.5">
              <div className="grid grid-cols-12 gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span className="col-span-5">Proyecto</span><span className="col-span-2">Estado</span>
                <span className="col-span-3">Progreso</span><span className="col-span-1 text-center">Pend.</span><span className="col-span-1 text-right">Resp.</span>
              </div>
              {misProyectos.map(function (p) { return <ProyectoRow key={p.id} p={p} go={go} />; })}
            </div>
          </Card>

          <Card title="Mis tareas" pad={false}
            action={<span className="text-xs text-zinc-400">por prioridad</span>}>
            <div className="px-2 py-1.5">
              {misTareas.map(function (t) { return <TareaRow key={t.id} t={t} go={go} />; })}
              {misTareas.length === 0 && <p className="px-3 py-6 text-sm text-zinc-400 text-center">Sin tareas pendientes 🎉</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Mis bloqueos activos"
            action={misBloqueos.length > 0 && <span className="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-500/15 px-1.5 rounded">{misBloqueos.length}</span>}>
            <div className="space-y-2.5">
              {misBloqueos.map(function (b) { return <BloqueoCard key={b.id} b={b} go={go} />; })}
              {misBloqueos.length === 0 && <p className="py-4 text-sm text-zinc-400 text-center">Ningún bloqueo. Todo fluye.</p>}
            </div>
          </Card>

          <Card title="Actividad reciente" pad={false}>
            <ul className="px-4 py-1 divide-y divide-zinc-100 dark:divide-zinc-800">
              {miActividad.map(function (a) { return <ActivityItem key={a.id} act={a} />; })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PersonalScreen, ProyectoRow, TareaRow, BloqueoCard });
