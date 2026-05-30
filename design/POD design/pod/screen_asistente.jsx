/* POD — Pantalla 6: Asistente IA · Presupuesto → Proyecto. */

const FASES_BASE = [
  { id: "f1", nombre: "Análisis", tareas: [
    { t: "Levantamiento de requisitos con el cliente", h: 16 },
    { t: "Modelo de datos y arquitectura de la integración", h: 12 },
  ]},
  { id: "f2", nombre: "Backend", tareas: [
    { t: "Conector con el ERP del cliente", h: 28 },
    { t: "Servicio de emisión de facturas (Verifactu)", h: 24 },
    { t: "Cola de reintentos y conciliación", h: 16 },
  ]},
  { id: "f3", nombre: "Frontend", tareas: [
    { t: "Panel de seguimiento de facturas emitidas", h: 18 },
    { t: "Pantalla de configuración del conector", h: 10 },
  ]},
  { id: "f4", nombre: "Testing", tareas: [
    { t: "Pruebas de integración contra entorno ERP", h: 14 },
    { t: "Validación fiscal de los XML generados", h: 10 },
  ]},
  { id: "f5", nombre: "Despliegue", tareas: [
    { t: "Despliegue en preproducción y UAT", h: 8 },
    { t: "Puesta en producción y monitorización", h: 6 },
  ]},
];

function FuenteTab({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={"flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] font-medium border transition " +
        (active ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-300"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800")}>
      <Icon name={icon} className="w-4 h-4" />{label}
    </button>
  );
}

const inputCls = "w-full bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition";

function AsistenteScreen({ route, go }) {
  const [step, setStep] = React.useState("upload");
  const [fuente, setFuente] = React.useState("pdf");
  const [genStep, setGenStep] = React.useState(0);
  const opp = route.oppId ? POD.byId(POD.oportunidades, route.oppId) : POD.byId(POD.oportunidades, "o4");

  const [nombre, setNombre] = React.useState("Integración ERP — Facturación electrónica");
  const [desc, setDesc] = React.useState("Conector entre el ERP de " + opp.cliente + " y la API de facturación Verifactu, con emisión, conciliación y panel de seguimiento.");
  const [fases, setFases] = React.useState(FASES_BASE);
  const [riesgos, setRiesgos] = React.useState([
    { texto: "La especificación de Verifactu sobre huella encadenada aún no está cerrada por la AEAT.", sev: "alta" },
    { texto: "Acceso al entorno de pruebas del ERP del cliente sin fecha confirmada.", sev: "media" },
    { texto: "Volumen de facturas en producción podría requerir escalado de la cola.", sev: "baja" },
  ]);
  const dependencias = [
    "Credenciales y documentación de la API del ERP del cliente",
    "Certificado fiscal para la firma de facturas",
    "Backend de facturación desplegado antes del Frontend",
  ];

  const totalHoras = fases.reduce((s, f) => s + f.tareas.reduce((a, t) => a + (Number(t.h) || 0), 0), 0);
  const totalTareas = fases.reduce((s, f) => s + f.tareas.length, 0);

  function lanzar() {
    setStep("generating"); setGenStep(0);
    const labels = [0, 1, 2, 3];
    labels.forEach((i) => setTimeout(() => setGenStep(i + 1), 450 * (i + 1)));
    setTimeout(() => setStep("draft"), 450 * 5);
  }
  function editTarea(fi, ti, key, val) {
    setFases(fs => fs.map((f, i) => i !== fi ? f : { ...f, tareas: f.tareas.map((t, j) => j !== ti ? t : { ...t, [key]: val }) }));
  }
  function delTarea(fi, ti) { setFases(fs => fs.map((f, i) => i !== fi ? f : { ...f, tareas: f.tareas.filter((_, j) => j !== ti) })); }
  function addTarea(fi) { setFases(fs => fs.map((f, i) => i !== fi ? f : { ...f, tareas: [...f.tareas, { t: "Nueva tarea", h: 8 }] })); }
  function delRiesgo(i) { setRiesgos(rs => rs.filter((_, j) => j !== i)); }

  /* ---------- Paso: subida ---------- */
  if (step === "upload") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500 text-white items-center justify-center mb-3"><Icon name="sparkles" className="w-6 h-6" /></span>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Generar proyecto a partir de un presupuesto</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg mx-auto">La IA propone fases, tareas, riesgos y estimaciones. Tú revisas y confirmas: nada se crea sin tu validación.</p>
        </div>

        <Card>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium text-zinc-400 mr-1">Origen:</span>
            <FuenteTab icon="file" label="PDF" active={fuente==="pdf"} onClick={() => setFuente("pdf")} />
            <FuenteTab icon="doc" label="DOCX" active={fuente==="docx"} onClick={() => setFuente("docx")} />
            <FuenteTab icon="edit" label="Texto" active={fuente==="texto"} onClick={() => setFuente("texto")} />
            <FuenteTab icon="bell" label="Correo" active={fuente==="correo"} onClick={() => setFuente("correo")} />
          </div>

          {fuente === "texto" ? (
            <textarea rows={6} className={inputCls + " resize-none font-mono"} defaultValue={"Pega aquí el texto del presupuesto o del correo del cliente…"} />
          ) : (
            <label className="block rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition cursor-pointer p-8 text-center">
              <Icon name="upload" className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
              <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200 mt-2">Arrastra el documento o haz clic para subir</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{fuente.toUpperCase()} · hasta 20 MB</p>
            </label>
          )}

          {opp && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40 px-3 py-2.5">
              <span className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-red-500"><Icon name="file" className="w-4 h-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">Presupuesto — {opp.cliente}.pdf</div>
                <div className="text-[11px] text-zinc-400">Desde la oportunidad · {POD.fmtEur(opp.importe)}</div>
              </div>
              <Badge tone="emerald" dot={false}>Detectado</Badge>
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => go({ name: "comercial" })} className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[14px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
            <button onClick={lanzar} className="h-10 px-4 rounded-lg bg-emerald-500 text-white text-[14px] font-medium hover:bg-emerald-600 transition flex items-center gap-2"><Icon name="sparkles" className="w-4 h-4" />Generar borrador</button>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------- Paso: generando ---------- */
  if (step === "generating") {
    const pasos = ["Leyendo el documento", "Identificando fases del proyecto", "Estimando tareas y horas", "Detectando riesgos y dependencias"];
    return (
      <div className="p-6 max-w-xl mx-auto pt-20">
        <Card>
          <div className="text-center mb-5">
            <span className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500 text-white items-center justify-center mb-3 animate-pulse"><Icon name="sparkles" className="w-6 h-6" /></span>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Analizando el presupuesto…</h3>
          </div>
          <ul className="space-y-2.5">
            {pasos.map((p, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className={"w-6 h-6 rounded-full flex items-center justify-center shrink-0 " +
                  (genStep > i ? "bg-emerald-500 text-white" : genStep === i ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300")}>
                  {genStep > i ? <Icon name="check" className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-current" />}
                </span>
                <span className={"text-[13px] " + (genStep >= i ? "text-zinc-800 dark:text-zinc-100 font-medium" : "text-zinc-400")}>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  /* ---------- Paso: confirmado ---------- */
  if (step === "confirmed") {
    return (
      <div className="p-6 max-w-xl mx-auto pt-20 text-center">
        <Card>
          <span className="inline-flex w-14 h-14 rounded-2xl bg-emerald-500 text-white items-center justify-center mb-4"><Icon name="check" className="w-7 h-7" /></span>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Proyecto creado</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">«{nombre}» se ha creado con {fases.length} fases y {totalTareas} tareas iniciales.</p>
          <div className="flex justify-center gap-2 mt-5">
            <button onClick={() => go({ name: "departamento" })} className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[14px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Ir al departamento</button>
            <button onClick={() => go({ name: "proyecto", id: "p2" })} className="h-10 px-4 rounded-lg bg-emerald-500 text-white text-[14px] font-medium hover:bg-emerald-600 transition flex items-center gap-2">Abrir proyecto<Icon name="chevron" className="w-4 h-4" /></button>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------- Paso: borrador editable ---------- */
  const sevTone = { alta: "red", media: "amber", baja: "zinc" };
  return (
    <div className="p-6 space-y-5 max-w-[1100px] mx-auto pb-24">
      {/* Banner pendiente de validar */}
      <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-500/[0.07] px-4 py-3">
        <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0"><Icon name="sparkles" className="w-4 h-4" /></span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">Borrador pendiente de validar</span>
            <Badge tone="amber" dot={false}>Generado por IA</Badge>
          </div>
          <p className="text-[12px] text-amber-700/90 dark:text-amber-200/70 mt-0.5">Revisa y ajusta cada sección. El proyecto no existe hasta que lo confirmes.</p>
        </div>
      </div>

      {/* Datos del proyecto */}
      <Card title="Proyecto propuesto">
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls + " font-medium"} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Descripción</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className={inputCls + " resize-none"} />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-400">Origen</span><span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">{opp.cliente} · {POD.fmtEur(opp.importe)}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-400">Fases</span><span className="font-mono text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{fases.length}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-400">Tareas</span><span className="font-mono text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{totalTareas}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-400">Estimación</span><span className="font-mono text-[13px] font-medium text-emerald-600 dark:text-emerald-400">{totalHoras} h</span></div>
        </div>
      </Card>

      {/* Fases y tareas */}
      <Card title="Fases y tareas iniciales" action={<span className="text-xs text-zinc-400">editable</span>}>
        <div className="space-y-4">
          {fases.map((f, fi) => {
            const horasFase = f.tareas.reduce((a, t) => a + (Number(t.h) || 0), 0);
            return (
              <div key={f.id} className="rounded-lg border border-zinc-150 dark:border-zinc-800">
                <div className="flex items-center justify-between px-3 h-10 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-zinc-400">{String(fi+1).padStart(2,"0")}</span>
                    <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{f.nombre}</span>
                    <span className="text-[11px] text-zinc-400">· {f.tareas.length} tareas</span>
                  </div>
                  <span className="font-mono text-[12px] font-medium text-zinc-500 dark:text-zinc-400">{horasFase} h</span>
                </div>
                <div className="p-2 space-y-1">
                  {f.tareas.map((t, ti) => (
                    <div key={ti} className="group flex items-center gap-2 px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                      <input value={t.t} onChange={e => editTarea(fi, ti, "t", e.target.value)}
                        className="flex-1 bg-transparent text-[13px] text-zinc-800 dark:text-zinc-100 px-1.5 py-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 focus:bg-zinc-50 dark:focus:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition" />
                      <div className="flex items-center gap-1 shrink-0">
                        <input type="number" value={t.h} onChange={e => editTarea(fi, ti, "h", e.target.value)}
                          className="w-14 bg-transparent font-mono text-[12px] text-right text-zinc-600 dark:text-zinc-300 px-1.5 py-1 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                        <span className="text-[11px] text-zinc-400">h</span>
                      </div>
                      <button onClick={() => delTarea(fi, ti)} className="w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <Icon name="blocked" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addTarea(fi)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-zinc-400 hover:text-emerald-600 transition">
                    <Icon name="plus" className="w-3.5 h-3.5" />Añadir tarea
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Riesgos */}
        <Card title="Riesgos detectados" action={<span className="text-xs text-zinc-400">{riesgos.length}</span>}>
          <div className="space-y-2">
            {riesgos.map((r, i) => (
              <div key={i} className="group flex items-start gap-2.5 rounded-lg border border-zinc-150 dark:border-zinc-800 px-3 py-2.5">
                <Icon name="alert" className={"w-4 h-4 mt-0.5 shrink-0 " + TONES[sevTone[r.sev]].text} />
                <p className="flex-1 text-[12px] text-zinc-700 dark:text-zinc-300 leading-snug">{r.texto}</p>
                <Badge tone={sevTone[r.sev]} dot={false} className="capitalize shrink-0">{r.sev}</Badge>
                <button onClick={() => delRiesgo(i)} className="w-5 h-5 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition shrink-0"><Icon name="blocked" className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {riesgos.length === 0 && <p className="text-[13px] text-zinc-400 py-2 text-center">Sin riesgos.</p>}
          </div>
        </Card>

        {/* Dependencias */}
        <Card title="Dependencias">
          <ul className="space-y-2">
            {dependencias.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12px] text-zinc-700 dark:text-zinc-300">
                <Icon name="link" className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                <span className="leading-snug">{d}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Barra de confirmación fija */}
      <div className="fixed bottom-0 left-60 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-6 py-3 z-20">
        <div className="max-w-[1100px] mx-auto flex items-center gap-3">
          <Icon name="sparkles" className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-[12px] text-zinc-500 dark:text-zinc-400 flex-1">Revisa el borrador. Al confirmar se creará el proyecto con {totalTareas} tareas ({totalHoras} h estimadas).</span>
          <button onClick={() => setStep("upload")} className="h-9 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Descartar</button>
          <button onClick={() => setStep("confirmed")} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition flex items-center gap-2"><Icon name="check" className="w-4 h-4" />Confirmar y crear proyecto</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AsistenteScreen });
