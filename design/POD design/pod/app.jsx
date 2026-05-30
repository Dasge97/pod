/* POD — Router + montaje. */

function App() {
  const [route, setRoute] = React.useState(function () {
    try { const s = localStorage.getItem("pod_route"); if (s) return JSON.parse(s); } catch (e) {}
    return { name: "departamento" };
  });
  const [theme, setTheme] = React.useState(function () {
    try { return localStorage.getItem("pod_theme") || "light"; } catch (e) { return "light"; }
  });

  React.useEffect(function () {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem("pod_theme", theme); } catch (e) {}
  }, [theme]);

  function go(r) {
    setRoute(r);
    try { localStorage.setItem("pod_route", JSON.stringify(r)); } catch (e) {}
    const main = document.getElementById("pod-main");
    if (main) main.scrollTop = 0;
  }

  // Configuración de la topbar por ruta
  let bar;
  if (route.name === "personal")       bar = { title: "Mi panel", sub: "viernes, 30 de mayo · ¿En qué estoy trabajando?" };
  else if (route.name === "departamento") bar = { title: "Departamento", sub: "Visión global del estado operativo" };
  else if (route.name === "comercial") bar = { title: "Comercial", sub: "Presupuestos y oportunidades abiertas" };
  else if (route.name === "asistente") bar = { crumbs: [{ label: "Comercial", go: () => go({ name: "comercial" }) }, { label: "Asistente IA" }] };
  else if (route.name === "proyecto") {
    const p = POD.byId(POD.proyectos, route.id) || POD.proyectos[0];
    bar = { crumbs: [{ label: "Departamento", go: () => go({ name: "departamento" }) }, { label: p.nombre }] };
  } else if (route.name === "oportunidad") {
    const o = POD.byId(POD.oportunidades, route.id) || POD.oportunidades[0];
    bar = { crumbs: [{ label: "Comercial", go: () => go({ name: "comercial" }) }, { label: o.cliente }] };
  }

  let screen;
  switch (route.name) {
    case "personal":     screen = <PersonalScreen go={go} />; break;
    case "departamento": screen = <DepartamentoScreen go={go} />; break;
    case "comercial":    screen = <ComercialScreen go={go} />; break;
    case "proyecto":     screen = <ProyectoScreen route={route} go={go} />; break;
    case "oportunidad":  screen = <OportunidadScreen route={route} go={go} />; break;
    case "asistente":    screen = <AsistenteScreen route={route} go={go} />; break;
    default:             screen = <DepartamentoScreen go={go} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Sidebar route={route} go={go} theme={theme} setTheme={setTheme} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar {...bar} go={go} />
        <main id="pod-main" className="flex-1 overflow-y-auto" data-screen-label={route.name}>{screen}</main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
