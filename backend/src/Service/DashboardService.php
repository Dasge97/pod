<?php

namespace App\Service;

use App\Entity\Proyecto;
use App\Entity\Usuario;
use App\Enum\EstadoOportunidad;
use App\Enum\EstadoProyecto;
use App\Enum\Prioridad;
use App\Repository\ActividadRepository;
use App\Repository\BloqueoRepository;
use App\Repository\OportunidadRepository;
use App\Repository\ProyectoRepository;
use App\Repository\TareaRepository;
use App\Repository\UsuarioRepository;

/**
 * Calcula los datos agregados de los tres dashboards (personal, departamental,
 * comercial), incluyendo riesgos, carga y alertas comerciales.
 */
class DashboardService
{
    public function __construct(
        private ProyectoRepository $proyectos,
        private TareaRepository $tareas,
        private BloqueoRepository $bloqueos,
        private OportunidadRepository $oportunidades,
        private ActividadRepository $actividad,
        private UsuarioRepository $usuarios,
        private Presenter $presenter,
    ) {
    }

    /** Dashboard personal. */
    public function me(Usuario $me): array
    {
        $mapaActividad = $this->actividad->ultimaActividadPorProyecto();
        $misProyectos = $this->proyectos->findByParticipante($me);
        $idsMisProyectos = array_map(fn (Proyecto $p) => $p->getId(), $misProyectos);

        $activos = array_filter($misProyectos, fn (Proyecto $p) => $p->getEstado() !== EstadoProyecto::Finalizado);

        $misTareas = $this->tareas->findAbiertasDeUsuario($me);
        usort($misTareas, fn ($a, $b) => $a->getPrioridad()->peso() <=> $b->getPrioridad()->peso());

        $misBloqueos = array_filter(
            $this->bloqueos->findActivos(),
            fn ($b) => in_array($b->getProyecto()?->getId(), $idsMisProyectos, true)
        );

        $feed = $this->actividad->findFeed(['proyectoIds' => $idsMisProyectos ?: [0]], 8);

        $progresoMedio = count($activos) > 0
            ? (int) round(array_sum(array_map(fn (Proyecto $p) => $p->getProgreso(), $activos)) / count($activos))
            : 0;

        $vencidas = count(array_filter($misTareas, fn ($t) => $t->isVencida()));

        return [
            'usuario' => $this->presenter->usuario($me),
            'kpis' => [
                'proyectosActivos' => count($activos),
                'proyectosTotales' => count($misProyectos),
                'tareasPendientes' => count($misTareas),
                'tareasVencidas' => $vencidas,
                'bloqueosActivos' => count($misBloqueos),
                'progresoMedio' => $progresoMedio,
            ],
            'proyectos' => array_map(fn (Proyecto $p) => $this->presenter->proyectoLite($p, $this->diasSinActividad($p, $mapaActividad)), array_values($misProyectos)),
            'tareas' => array_map(fn ($t) => $this->presenter->tarea($t), array_values($misTareas)),
            'bloqueos' => array_map(fn ($b) => $this->presenter->bloqueo($b), array_values($misBloqueos)),
            'actividad' => array_map(fn ($a) => $this->presenter->actividad($a), $feed),
        ];
    }

    /** Dashboard departamental. */
    public function department(): array
    {
        $mapaActividad = $this->actividad->ultimaActividadPorProyecto();
        $todos = $this->proyectos->findAllConRelaciones();
        $bloqueosActivos = $this->bloqueos->findActivos();

        $bloqueosPorProyecto = [];
        foreach ($bloqueosActivos as $b) {
            $bloqueosPorProyecto[$b->getProyecto()?->getId()][] = $b;
        }

        $vencidas = $this->tareas->findVencidas();
        $vencidasPorProyecto = [];
        foreach ($vencidas as $t) {
            $vencidasPorProyecto[$t->getProyecto()?->getId()][] = $t;
        }

        $activos = array_filter($todos, fn (Proyecto $p) => $p->getEstado() !== EstadoProyecto::Finalizado);

        // Riesgos
        $riesgoSinActividad = [];
        $riesgoBloqueos = [];
        $riesgoVencidas = [];
        foreach ($todos as $p) {
            $dias = $this->diasSinActividad($p, $mapaActividad);
            if ($p->getEstado() !== EstadoProyecto::Finalizado && $dias !== null && $dias >= 7) {
                $riesgoSinActividad[] = ['proyecto' => $this->presenter->proyectoLite($p, $dias), 'dias' => $dias];
            }
            if (!empty($bloqueosPorProyecto[$p->getId()])) {
                $bs = $bloqueosPorProyecto[$p->getId()];
                $riesgoBloqueos[] = [
                    'proyecto' => $this->presenter->proyectoLite($p, $dias),
                    'bloqueos' => count($bs),
                    'diasMax' => max(array_map(fn ($b) => $b->getDiasAbierto(), $bs)),
                ];
            } elseif (!empty($vencidasPorProyecto[$p->getId()])) {
                $riesgoVencidas[] = [
                    'proyecto' => $this->presenter->proyectoLite($p, $dias),
                    'vencidas' => count($vencidasPorProyecto[$p->getId()]),
                ];
            }
        }

        // Vencidas por usuario asignado.
        $vencidasPorUsuario = [];
        foreach ($vencidas as $t) {
            if ($t->getAsignado()) {
                $uid = $t->getAsignado()->getId();
                $vencidasPorUsuario[$uid] = ($vencidasPorUsuario[$uid] ?? 0) + 1;
            }
        }
        // Bloqueos activos que afectan a cada persona (responsable del proyecto o asignado de la tarea).
        $bloqueosPorUsuario = [];
        foreach ($bloqueosActivos as $b) {
            $afectados = [];
            if ($b->getProyecto()?->getResponsable()) {
                $afectados[$b->getProyecto()->getResponsable()->getId()] = true;
            }
            if ($b->getTarea()?->getAsignado()) {
                $afectados[$b->getTarea()->getAsignado()->getId()] = true;
            }
            foreach (array_keys($afectados) as $uid) {
                $bloqueosPorUsuario[$uid] = ($bloqueosPorUsuario[$uid] ?? 0) + 1;
            }
        }

        // Equipo (protagonista): una fila por persona, orientada a su carga real.
        $equipo = [];
        foreach ($this->usuarios->findActivos() as $u) {
            $abiertas = $this->tareas->countAbiertasPorUsuario($u);
            $participa = $this->proyectos->findByParticipante($u);
            $lidera = count(array_filter($participa, fn (Proyecto $p) => $p->getResponsable()?->getId() === $u->getId()));
            $carga = min(100, $abiertas * 14);
            $equipo[] = [
                'usuario' => $this->presenter->usuario($u),
                'carga' => $carga,
                'estado' => $carga >= 90 ? 'saturado' : ($carga <= 40 ? 'holgura' : 'ok'),
                'proyectos' => count($participa),
                'proyectosLidera' => $lidera,
                'tareasAbiertas' => $abiertas,
                'tareasVencidas' => $vencidasPorUsuario[$u->getId()] ?? 0,
                'bloqueos' => $bloqueosPorUsuario[$u->getId()] ?? 0,
            ];
        }
        usort($equipo, fn ($a, $b) => $b['carga'] <=> $a['carga']);

        return [
            // KPIs orientados al equipo (protagonista).
            'kpisEquipo' => [
                'personas' => count($equipo),
                'saturados' => count(array_filter($equipo, fn ($c) => $c['carga'] >= 90)),
                'tareasVencidas' => count($vencidas),
                'bloqueosActivos' => count($bloqueosActivos),
            ],
            // KPIs de proyectos (sección secundaria).
            'kpisProyectos' => [
                'activos' => count($activos),
                'total' => count($todos),
                'bloqueados' => count(array_filter($todos, fn (Proyecto $p) => $p->getEstado() === EstadoProyecto::Bloqueado)),
                'retrasados' => count(array_filter($todos, fn (Proyecto $p) => $p->isRetrasado())),
                'enRevision' => count(array_filter($todos, fn (Proyecto $p) => $p->getEstado() === EstadoProyecto::Revision)),
                'finalizados' => count(array_filter($todos, fn (Proyecto $p) => $p->getEstado() === EstadoProyecto::Finalizado)),
            ],
            'equipo' => $equipo,
            'riesgos' => [
                'sinActividad' => $riesgoSinActividad,
                'conBloqueos' => $riesgoBloqueos,
                'conVencidas' => $riesgoVencidas,
            ],
            'proyectos' => array_map(fn (Proyecto $p) => $this->presenter->proyectoLite($p, $this->diasSinActividad($p, $mapaActividad)), array_values($todos)),
            'actividad' => array_map(fn ($a) => $this->presenter->actividad($a), $this->actividad->findFeed([], 15)),
        ];
    }

    /** Detalle operativo de una persona: lo que lleva, su carga, tareas y bloqueos. */
    public function personaOverview(Usuario $u): array
    {
        $participa = $this->proyectos->findByParticipante($u);
        $tareas = $this->tareas->findAbiertasDeUsuario($u);
        usort($tareas, fn ($a, $b) => $a->getPrioridad()->peso() <=> $b->getPrioridad()->peso());

        // Bloqueos activos que afectan a la persona.
        $bloqueos = array_filter($this->bloqueos->findActivos(), function ($b) use ($u) {
            return $b->getProyecto()?->getResponsable()?->getId() === $u->getId()
                || $b->getTarea()?->getAsignado()?->getId() === $u->getId();
        });

        $abiertas = count($tareas);
        $vencidas = count(array_filter($tareas, fn ($t) => $t->isVencida()));
        $lidera = count(array_filter($participa, fn (Proyecto $p) => $p->getResponsable()?->getId() === $u->getId()));
        $carga = min(100, $abiertas * 14);

        // Proyectos con el rol de la persona en cada uno.
        $proyectos = array_map(function (Proyecto $p) use ($u) {
            $data = $this->presenter->proyectoLite($p);
            $data['esResponsable'] = $p->getResponsable()?->getId() === $u->getId();
            return $data;
        }, $participa);

        return [
            'usuario' => $this->presenter->usuario($u),
            'kpis' => [
                'carga' => $carga,
                'estado' => $carga >= 90 ? 'saturado' : ($carga <= 40 ? 'holgura' : 'ok'),
                'proyectos' => count($participa),
                'proyectosLidera' => $lidera,
                'tareasAbiertas' => $abiertas,
                'tareasVencidas' => $vencidas,
                'bloqueos' => count($bloqueos),
            ],
            'proyectos' => $proyectos,
            'tareas' => array_map(fn ($t) => $this->presenter->tarea($t), $tareas),
            'bloqueos' => array_map(fn ($b) => $this->presenter->bloqueo($b), array_values($bloqueos)),
        ];
    }

    /** Dashboard comercial. */
    public function sales(): array
    {
        $todas = $this->oportunidades->findAllOrdenadas();
        $abiertas = array_filter($todas, fn ($o) => $o->getEstado()->esAbierta());

        $pipeline = array_sum(array_map(fn ($o) => $o->getImporte(), $abiertas));
        $ponderado = (int) round(array_sum(array_map(fn ($o) => $o->getImporte() * $o->getProbabilidad() / 100, $abiertas)));
        $ganado = array_sum(array_map(
            fn ($o) => $o->getImporte(),
            array_filter($todas, fn ($o) => $o->getEstado() === EstadoOportunidad::Aceptado)
        ));

        $sinRespuesta = array_filter($abiertas, fn ($o) => $o->getEstado() === EstadoOportunidad::SinRespuesta && ($o->getDiasDesdeEnvio() ?? 0) > 14);
        $sinSeguimiento = array_filter($abiertas, fn ($o) => ($o->getDiasSinSeguimiento() ?? 0) > 14 && $o->getEstado() !== EstadoOportunidad::SinRespuesta);
        $altaProbInactiva = array_filter($abiertas, fn ($o) => $o->getProbabilidad() >= 70 && ($o->getDiasSinSeguimiento() ?? 0) > 10);

        $embudo = [];
        foreach ([EstadoOportunidad::Enviado, EstadoOportunidad::Negociacion, EstadoOportunidad::SinRespuesta, EstadoOportunidad::Borrador] as $e) {
            $delEstado = array_filter($abiertas, fn ($o) => $o->getEstado() === $e);
            $embudo[] = [
                'estado' => $e->value,
                'label' => $e->label(),
                'n' => count($delEstado),
                'importe' => array_sum(array_map(fn ($o) => $o->getImporte(), $delEstado)),
            ];
        }

        return [
            'kpis' => [
                'pipeline' => $pipeline,
                'ponderado' => $ponderado,
                'ganado' => $ganado,
                'alertas' => count($sinRespuesta) + count($sinSeguimiento) + count($altaProbInactiva),
            ],
            'oportunidades' => array_map(fn ($o) => $this->presenter->oportunidad($o), array_values($abiertas)),
            'alertas' => [
                'sinRespuesta' => array_map(fn ($o) => $this->presenter->oportunidad($o), array_values($sinRespuesta)),
                'sinSeguimiento' => array_map(fn ($o) => $this->presenter->oportunidad($o), array_values($sinSeguimiento)),
                'altaProbInactiva' => array_map(fn ($o) => $this->presenter->oportunidad($o), array_values($altaProbInactiva)),
            ],
            'embudo' => $embudo,
        ];
    }

    /** @param array<int, \DateTimeImmutable> $mapa */
    private function diasSinActividad(Proyecto $p, array $mapa): ?int
    {
        $ultima = $mapa[$p->getId()] ?? $p->getFechaCreacion();
        return (int) $ultima->diff(new \DateTimeImmutable())->days;
    }
}
