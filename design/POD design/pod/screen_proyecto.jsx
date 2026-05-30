/* POD — Pantalla 4: Detalle de Proyecto. */

const ROL_PART = {
  responsable: { label: "Responsable", tone: "emerald" },
  colaborador: { label: "Colaborador", tone: "blue" },
  consultado:  { label: "Consultado",  tone: "zinc" },
};

function DateBox({ label, value, icon, tone = "zinc" }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={"w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-inset " + TONES[tone].soft}><Icon name={icon} className="w-4 h-4" /></span>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{label}</div>
        <div className="font-mono text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{value || "—"}</div>
      </div>
    </div>
  );
}

function ProyectoScreen({ route, go }) {
  const p = POD.byId(POD.proyectos, route.id) || POD.proyectos[0];
  const tareas = POD.tareas.filter(t => t.proyecto === p.id);
  const parts = (POD.participantes[p.id] || []);
  const bloqueos = POD.bloqueos.filter(b => b.proyecto === p.id);
  const activos = bloqueos.filter(b => b.estado === "activo");
  const tl = POD.timeline[p.id] || POD.actividad.filter(a => a.proyecto === p.id).map(a => ({ tipo: a.tipo, user: a.user, cuando: a.cuando, texto: a.texto + " " + a.objeto }));
  const barTone = p.estado === "bloqueado" ? "red" : p.estado === "finalizado" ? "emerald" : p.estado === "revision" ? "violet" : "blue";
  const finalizadas = tareas.filter(t => t.estado === "finalizada").length;

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Cabecera */}
      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <EstadoBadge estado={p.estado} />
              <PrioridadBadge prioridad={p.prioridad} />
              {p.retrasado && <Badge tone="amber"><Icon name="clock" className="w-3 h-3" />Retrasado</Badge>}
              {activos.length > 0 && <Badge tone="red"><Icon name="alert" className="w-3 h-3" />{activos.length} bloqueo{activos.length>1?"s":""}</Badge>}
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{p.nombre}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">{p.descripcion}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-zinc-400">Cliente</span>
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{p.cliente}</span>
              <span className="mx-1 text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Responsable</span>
              <Avatar id={p.responsable} size="sm" />
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{POD.user(p.responsable).nombre}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1.5"><Icon name="edit" className="w-4 h-4" />Editar</button>
            <button className="h-9 px-3 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition flex items-center gap-1.5"><Icon name="plus" className="w-4 h-4" />Nueva tarea</button>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Progreso</span>
              <span className="font-mono text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{p.progreso}%</span>
            </div>
            <Progress value={p.progreso} tone={barTone} />
            <div className="text-[11px] text-zinc-400 mt-1.5">{finalizadas}/{tareas.length} tareas · {p.tareasPend} pendientes</div>
          </div>
          <DateBox label="Inicio" value={p.inicio} icon="calendar" />
          <DateBox label="Fin estimada" value={p.finEst} icon="calendar" tone={p.retrasado ? "amber" : "zinc"} />
          <DateBox label="Fin real" value={p.finReal} icon="check" tone={p.finReal ? "emerald" : "zinc"} />
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Bloqueos */}
          {activos.length > 0 && (
            <Card title="Bloqueos del proyecto"
              action={<span className="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-500/15 px-1.5 rounded">{activos.length} activo{activos.length>1?"s":""}</span>}>
              <div className="space-y-2.5">
                {activos.map(b => (
                  <div key={b.id} className="rounded-lg border border-red-200/70 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/[0.07] p-3">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center"><Icon name="alert" className="w-4 h-4" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge tone={b.severidad==="critica"?"red":"amber"} dot={false} className="capitalize">{b.severidad}</Badge>
                          <span className="text-[11px] text-zinc-400">{b.fecha} · {POD.user(b.creadoPor).nombre}</span>
                        </div>
                        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{b.titulo}</p>
                        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{b.descripcion}</p>
                      </div>
                      <button className="shrink-0 h-7 px-2.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[12px] font-medium text-zinc-700 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-600 transition">Resolver</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tareas */}
          <Card title="Tareas" pad={false}
            action={<span className="text-xs text-zinc-400 font-mono">{tareas.length}</span>}>
            <div className="px-2 py-1.5">
              {tareas.map(t => <TareaRow key={t.id} t={t} go={go} showProyecto={false} />)}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Participantes */}
          <Card title="Participantes" pad={false}>
            <div className="px-2 py-2 space-y-0.5">
              {parts.map(pp => (
                <div key={pp.u} className="flex items-center gap-3 px-3 h-12">
                  <Avatar id={pp.u} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{POD.user(pp.u).nombre}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{POD.user(pp.u).rol}</div>
                  </div>
                  <Badge tone={ROL_PART[pp.rol].tone} dot={false}>{ROL_PART[pp.rol].label}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Timeline */}
          <Card title="Actividad del proyecto" pad={false}>
            <ul className="px-4 py-1 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[380px] overflow-y-auto">
              {tl.map((a, i) => (
                <li key={i} className="flex gap-3 py-2.5">
                  <span className={"mt-0.5 w-7 h-7 shrink-0 rounded-full flex items-center justify-center ring-1 ring-inset " + TONES[ACT_TONE[a.tipo] || "zinc"].soft}>
                    <Icon name={ACT_ICON[a.tipo] || "dot"} className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{POD.user(a.user).nombre}</span> {a.texto}
                    </p>
                    <span className="text-xs text-zinc-400">{a.cuando}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProyectoScreen });
