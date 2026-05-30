/* POD — Primitivas de UI + chrome (sidebar, topbar). Estética tipo shadcn/ui. */

/* ---------- Iconos (line icons simples) ---------- */
const ICON_PATHS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  layers: "M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17l9 5 9-5",
  trending: "M3 17l6-6 4 4 8-8M21 7h-5M21 7v5",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
  file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M9 13h6M9 17h6",
  check: "M4 12.5 9 17.5 20 6.5",
  checkbox: "M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  alert: "M12 8v5M12 16.5v.5M10.3 3.9 2.3 18a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  users: "M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 19v-2a4 4 0 0 0-3-3.8M16 2.2a3.5 3.5 0 0 1 0 6.6",
  sparkles: "M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4L12 3ZM19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z",
  sun: "M12 4V2M12 22v-2M6 6 4.5 4.5M19.5 19.5 18 18M4 12H2M22 12h-2M6 18l-1.5 1.5M19.5 4.5 18 6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  moon: "M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  chevron: "M9 18l6-6-6-6",
  plus: "M12 5v14M5 12h14",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  dot: "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  blocked: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM5.6 5.6l12.8 12.8",
  calendar: "M8 3v3M16 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  upload: "M12 16V4M7 9l5-5 5 5M5 18v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1",
  flag: "M5 21V4M5 4h11l-2 3 2 3H5",
  link: "M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1",
  filter: "M3 5h18l-7 8v5l-4 2v-7L3 5Z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  edit: "M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 6.5l3 3",
  doc: "M9 13h6M9 17h6M9 9h2M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5",
};

function Icon({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" className={className || "w-4 h-4"}>
      <path d={ICON_PATHS[name] || ICON_PATHS.dot} />
    </svg>
  );
}

/* ---------- Mapa de tonos (claro + oscuro) ---------- */
const TONES = {
  zinc:    { dot:"bg-zinc-400",    soft:"bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700", bar:"bg-zinc-400", text:"text-zinc-500 dark:text-zinc-400" },
  blue:    { dot:"bg-blue-500",    soft:"bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/25", bar:"bg-blue-500", text:"text-blue-600 dark:text-blue-300" },
  amber:   { dot:"bg-amber-500",   soft:"bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25", bar:"bg-amber-500", text:"text-amber-600 dark:text-amber-300" },
  red:     { dot:"bg-red-500",     soft:"bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/25", bar:"bg-red-500", text:"text-red-600 dark:text-red-300" },
  violet:  { dot:"bg-violet-500",  soft:"bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/25", bar:"bg-violet-500", text:"text-violet-600 dark:text-violet-300" },
  emerald: { dot:"bg-emerald-500", soft:"bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25", bar:"bg-emerald-500", text:"text-emerald-600 dark:text-emerald-300" },
};

const PROYECTO_ESTADO = {
  pendiente:  { label:"Pendiente",   tone:"zinc" },
  progreso:   { label:"En progreso", tone:"blue" },
  bloqueado:  { label:"Bloqueado",   tone:"red" },
  revision:   { label:"En revisión", tone:"violet" },
  finalizado: { label:"Finalizado",  tone:"emerald" },
};
const TAREA_ESTADO = {
  pendiente:  { label:"Pendiente",   tone:"zinc" },
  progreso:   { label:"En progreso", tone:"blue" },
  bloqueada:  { label:"Bloqueada",   tone:"red" },
  finalizada: { label:"Finalizada",  tone:"emerald" },
};
const PRIORIDAD = {
  baja:    { label:"Baja",    tone:"zinc" },
  media:   { label:"Media",   tone:"blue" },
  alta:    { label:"Alta",    tone:"amber" },
  critica: { label:"Crítica", tone:"red" },
};
const OPP_ESTADO = {
  borrador:     { label:"Borrador",       tone:"zinc" },
  enviado:      { label:"Enviado",        tone:"blue" },
  negociacion:  { label:"En negociación", tone:"violet" },
  aceptado:     { label:"Aceptado",       tone:"emerald" },
  rechazado:    { label:"Rechazado",      tone:"zinc" },
  sin_respuesta:{ label:"Sin respuesta",  tone:"amber" },
};

/* ---------- Badge ---------- */
function Badge({ tone = "zinc", children, dot = true, className = "" }) {
  const t = TONES[tone] || TONES.zinc;
  return (
    <span className={"inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap " + t.soft + " " + className}>
      {dot && <span className={"w-1.5 h-1.5 rounded-full " + t.dot} />}
      {children}
    </span>
  );
}
function EstadoBadge({ estado })   { const m = PROYECTO_ESTADO[estado] || PROYECTO_ESTADO.pendiente; return <Badge tone={m.tone}>{m.label}</Badge>; }
function TareaBadge({ estado })    { const m = TAREA_ESTADO[estado] || TAREA_ESTADO.pendiente;       return <Badge tone={m.tone}>{m.label}</Badge>; }
function OppBadge({ estado })      { const m = OPP_ESTADO[estado] || OPP_ESTADO.borrador;            return <Badge tone={m.tone}>{m.label}</Badge>; }
function PrioridadBadge({ prioridad }) {
  const m = PRIORIDAD[prioridad] || PRIORIDAD.baja;
  return (
    <span className={"inline-flex items-center gap-1 text-xs font-medium " + (TONES[m.tone]||TONES.zinc).text}>
      <Icon name="flag" className="w-3 h-3" />{m.label}
    </span>
  );
}

/* ---------- Avatar ---------- */
function Avatar({ id, size = "md" }) {
  const u = POD.user(id); if (!u) return null;
  const s = size === "sm" ? "w-6 h-6 text-[10px]" : size === "lg" ? "w-9 h-9 text-sm" : "w-7 h-7 text-xs";
  return <span title={u.nombre} className={"inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 " + u.color + " " + s}>{u.ini}</span>;
}
function AvatarStack({ ids, max = 4 }) {
  const shown = ids.slice(0, max), extra = ids.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map(function (id) { return <span key={id} className="ring-2 ring-white dark:ring-zinc-900 rounded-full"><Avatar id={id} size="sm" /></span>; })}
      </div>
      {extra > 0 && <span className="ml-1 text-xs text-zinc-400">+{extra}</span>}
    </div>
  );
}

/* ---------- Barra de progreso ---------- */
function Progress({ value, tone = "emerald", className = "" }) {
  const t = TONES[tone] || TONES.emerald;
  return (
    <div className={"h-1.5 rounded-full bg-zinc-150 dark:bg-zinc-800 overflow-hidden " + className}>
      <div className={"h-full rounded-full " + t.bar} style={{ width: Math.max(2, value) + "%" }} />
    </div>
  );
}

/* ---------- KPI card ---------- */
function Kpi({ icon, label, value, sub, tone = "zinc", onClick }) {
  const t = TONES[tone] || TONES.zinc;
  return (
    <button onClick={onClick} disabled={!onClick}
      className={"text-left rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition " + (onClick ? "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm cursor-pointer" : "cursor-default")}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-zinc-500 dark:text-zinc-400">{label}</span>
        {icon && <span className={"w-7 h-7 rounded-lg flex items-center justify-center ring-1 ring-inset " + t.soft}><Icon name={icon} className="w-4 h-4" /></span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</span>
        {sub && <span className="text-xs text-zinc-400">{sub}</span>}
      </div>
    </button>
  );
}

/* ---------- Card contenedor ---------- */
function Card({ title, action, children, pad = true, className = "" }) {
  return (
    <section className={"rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 " + className}>
      {(title || action) && (
        <header className="flex items-center justify-between px-4 h-12 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
          {action}
        </header>
      )}
      <div className={pad ? "p-4" : ""}>{children}</div>
    </section>
  );
}

/* ---------- Iconos de actividad ---------- */
const ACT_ICON = { tarea:"checkbox", bloqueo:"alert", estado:"flag", comentario:"doc", proyecto:"folder", oportunidad:"trending" };
const ACT_TONE = { tarea:"blue", bloqueo:"red", estado:"violet", comentario:"zinc", proyecto:"emerald", oportunidad:"amber" };

function ActivityItem({ act, showProyecto = true }) {
  const u = POD.user(act.user);
  const proy = act.proyecto ? POD.byId(POD.proyectos, act.proyecto) : null;
  const tone = ACT_TONE[act.tipo] || "zinc"; const t = TONES[tone];
  return (
    <li className="flex gap-3 py-2.5">
      <span className={"mt-0.5 w-7 h-7 shrink-0 rounded-full flex items-center justify-center ring-1 ring-inset " + t.soft}>
        <Icon name={ACT_ICON[act.tipo] || "dot"} className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{u ? u.nombre : "—"}</span> {act.texto}{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{act.objeto}</span>
          {showProyecto && proy && <span className="text-zinc-400"> · {proy.nombre}</span>}
        </p>
        <span className="text-xs text-zinc-400">{act.cuando}</span>
      </div>
    </li>
  );
}

/* ---------- Indicador de carga ---------- */
function CargaBar({ value }) {
  const tone = value >= 90 ? "red" : value >= 75 ? "amber" : "emerald";
  return (
    <div className="flex items-center gap-2 w-32">
      <Progress value={value} tone={tone} className="flex-1" />
      <span className={"font-mono text-xs tabular-nums " + (TONES[tone].text)}>{value}%</span>
    </div>
  );
}

/* ---------- Sidebar ---------- */
function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <button onClick={onClick}
      className={"group w-full flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[13px] font-medium transition " +
        (active ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50")}>
      <Icon name={icon} className={"w-4 h-4 " + (active ? "text-emerald-600 dark:text-emerald-400" : "")} />
      <span className="flex-1 text-left">{label}</span>
      {badge != null && <span className={"font-mono text-[11px] px-1.5 rounded " + (badge > 0 ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300" : "text-zinc-400")}>{badge}</span>}
    </button>
  );
}

function Sidebar({ route, go, theme, setTheme }) {
  const me = POD.user(POD.currentUser);
  const bloqueosActivos = POD.bloqueos.filter(function (b) { return b.estado === "activo"; }).length;
  return (
    <aside className="w-60 shrink-0 h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-zinc-100 dark:border-zinc-800">
        <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold tracking-tight">P</span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">POD</div>
          <div className="text-[10px] text-zinc-400 -mt-0.5">Panel Operativo de Desarrollo</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-0.5">
          <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Paneles</div>
          <NavItem icon="home"     label="Mi panel"      active={route.name==="personal"}    onClick={() => go({name:"personal"})} />
          <NavItem icon="layers"   label="Departamento"  active={route.name==="departamento"} onClick={() => go({name:"departamento"})} />
          <NavItem icon="trending" label="Comercial"     active={route.name==="comercial"}    onClick={() => go({name:"comercial"})} />
        </div>
        <div className="space-y-0.5">
          <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Operación</div>
          <NavItem icon="folder" label="Proyectos"     active={route.name==="proyecto"}    onClick={() => go({name:"proyecto", id:"p1"})} />
          <NavItem icon="file"   label="Oportunidades" active={route.name==="oportunidad"} onClick={() => go({name:"oportunidad", id:"o4"})} />
          <NavItem icon="alert"  label="Bloqueos"      badge={bloqueosActivos} active={false} onClick={() => go({name:"departamento"})} />
          <NavItem icon="sparkles" label="Asistente IA" active={route.name==="asistente"}  onClick={() => go({name:"asistente"})} />
        </div>
      </nav>

      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[13px] font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50 transition">
          <Icon name={theme === "dark" ? "sun" : "moon"} className="w-4 h-4" />
          <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
        </button>
        <div className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-md">
          <Avatar id={me.id} size="lg" />
          <div className="leading-tight min-w-0 flex-1">
            <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-50 truncate">{me.nombre}</div>
            <div className="text-[11px] text-zinc-400 truncate">{me.rol}</div>
          </div>
          <Icon name="logout" className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
        </div>
      </div>
    </aside>
  );
}

/* ---------- Topbar ---------- */
function Topbar({ title, sub, crumbs, go, actions }) {
  return (
    <header className="h-14 shrink-0 flex items-center gap-4 px-6 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
      <div className="min-w-0 flex-1">
        {crumbs ? (
          <div className="flex items-center gap-1.5 text-sm">
            {crumbs.map(function (c, i) {
              return (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <Icon name="chevron" className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />}
                  {c.go ? <button onClick={c.go} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">{c.label}</button>
                        : <span className="font-semibold text-zinc-900 dark:text-zinc-50">{c.label}</span>}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="leading-tight">
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
            {sub && <p className="text-xs text-zinc-400">{sub}</p>}
          </div>
        )}
      </div>
      <div className="hidden md:flex items-center h-9 px-3 gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 w-64 bg-zinc-50/50 dark:bg-zinc-800/30">
        <Icon name="search" className="w-4 h-4" />
        <span className="text-[13px]">Buscar…</span>
        <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400">⌘K</kbd>
      </div>
      <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
        <Icon name="bell" className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
      </button>
      {actions}
    </header>
  );
}

Object.assign(window, {
  Icon, Badge, EstadoBadge, TareaBadge, OppBadge, PrioridadBadge,
  Avatar, AvatarStack, Progress, Kpi, Card, ActivityItem, CargaBar,
  Sidebar, Topbar, TONES, PROYECTO_ESTADO, TAREA_ESTADO, PRIORIDAD, OPP_ESTADO,
  ACT_ICON, ACT_TONE,
});
