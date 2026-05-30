<?php

namespace App\Service;

use App\Entity\Actividad;
use App\Entity\Bloqueo;
use App\Entity\Oportunidad;
use App\Entity\Proyecto;
use App\Entity\ProyectoUsuario;
use App\Entity\Tarea;
use App\Entity\Usuario;
use App\Enum\EstadoTarea;

/**
 * Convierte entidades en arrays JSON (view-models) con los campos derivados que
 * el frontend consume directamente. Centraliza la serialización de la API.
 */
class Presenter
{
    public function usuario(?Usuario $u): ?array
    {
        if ($u === null) {
            return null;
        }
        return [
            'id' => $u->getId(),
            'nombre' => $u->getNombre(),
            'email' => $u->getEmail(),
            'rol' => $u->getRol()->value,
            'rolLabel' => $u->getRol()->label(),
            'roles' => $u->getRoles(),
            'color' => $u->getColor(),
            'iniciales' => $u->getIniciales(),
            'avatar' => $u->getAvatar(),
            'activo' => $u->isActivo(),
        ];
    }

    /** Versión ligera para listados de proyectos. */
    public function proyectoLite(Proyecto $p, ?int $diasSinActividad = null): array
    {
        $tareas = $p->getTareas();
        $total = $tareas->count();
        $pendientes = 0;
        foreach ($tareas as $t) {
            if ($t->getEstado() !== EstadoTarea::Finalizada) {
                $pendientes++;
            }
        }

        return [
            'id' => $p->getId(),
            'nombre' => $p->getNombre(),
            'cliente' => $p->getCliente(),
            'estado' => $p->getEstado()->value,
            'estadoLabel' => $p->getEstado()->label(),
            'prioridad' => $p->getPrioridad()->value,
            'prioridadLabel' => $p->getPrioridad()->label(),
            'progreso' => $p->getProgreso(),
            'responsable' => $this->usuario($p->getResponsable()),
            'tareasPend' => $pendientes,
            'tareasTot' => $total,
            'retrasado' => $p->isRetrasado(),
            'diasSinActividad' => $diasSinActividad,
        ];
    }

    /** Detalle completo de proyecto. */
    public function proyectoDetalle(Proyecto $p, ?int $diasSinActividad = null): array
    {
        $base = $this->proyectoLite($p, $diasSinActividad);
        return array_merge($base, [
            'descripcion' => $p->getDescripcion(),
            'fechaInicio' => $this->fecha($p->getFechaInicio()),
            'fechaFinEstimada' => $this->fecha($p->getFechaFinEstimada()),
            'fechaFinReal' => $this->fecha($p->getFechaFinReal()),
            'activo' => $p->isActivo(),
            'oportunidadId' => $p->getOportunidad()?->getId(),
        ]);
    }

    public function participante(ProyectoUsuario $pu): array
    {
        return [
            'usuario' => $this->usuario($pu->getUsuario()),
            'rol' => $pu->getRol()->value,
            'rolLabel' => $pu->getRol()->label(),
        ];
    }

    public function tarea(Tarea $t, bool $conProyecto = true): array
    {
        $data = [
            'id' => $t->getId(),
            'titulo' => $t->getTitulo(),
            'descripcion' => $t->getDescripcion(),
            'estado' => $t->getEstado()->value,
            'estadoLabel' => $t->getEstado()->label(),
            'prioridad' => $t->getPrioridad()->value,
            'prioridadLabel' => $t->getPrioridad()->label(),
            'asignado' => $this->usuario($t->getAsignado()),
            'estimacionHoras' => $t->getEstimacionHoras(),
            'horasConsumidas' => $t->getHorasConsumidas(),
            'fechaLimite' => $this->fecha($t->getFechaLimite()),
            'vencida' => $t->isVencida(),
        ];
        if ($conProyecto && $t->getProyecto()) {
            $data['proyecto'] = [
                'id' => $t->getProyecto()->getId(),
                'nombre' => $t->getProyecto()->getNombre(),
            ];
        }
        return $data;
    }

    public function bloqueo(Bloqueo $b): array
    {
        return [
            'id' => $b->getId(),
            'titulo' => $b->getTitulo(),
            'descripcion' => $b->getDescripcion(),
            'severidad' => $b->getSeveridad()->value,
            'severidadLabel' => $b->getSeveridad()->label(),
            'proyecto' => $b->getProyecto() ? [
                'id' => $b->getProyecto()->getId(),
                'nombre' => $b->getProyecto()->getNombre(),
            ] : null,
            'tareaId' => $b->getTarea()?->getId(),
            'creadoPor' => $this->usuario($b->getCreadoPor()),
            'fechaCreacion' => $this->fechaHora($b->getFechaCreacion()),
            'resuelto' => $b->isResuelto(),
            'fechaResolucion' => $this->fechaHora($b->getFechaResolucion()),
            'diasAbierto' => $b->getDiasAbierto(),
        ];
    }

    public function oportunidad(Oportunidad $o): array
    {
        // Collection::first() devuelve false (no null) cuando está vacía, así que
        // no se puede encadenar con ?-> directamente.
        $proyectoGenerado = $o->getProyectosGenerados()->first() ?: null;

        return [
            'id' => $o->getId(),
            'nombre' => $o->getNombre(),
            'cliente' => $o->getCliente(),
            'descripcion' => $o->getDescripcion(),
            'importe' => $o->getImporte(),
            'responsable' => $this->usuario($o->getResponsableComercial()),
            'estado' => $o->getEstado()->value,
            'estadoLabel' => $o->getEstado()->label(),
            'probabilidad' => $o->getProbabilidad(),
            'fechaEnvio' => $this->fecha($o->getFechaEnvio()),
            'diasEnvio' => $o->getDiasDesdeEnvio(),
            'diasSinSeguimiento' => $o->getDiasSinSeguimiento(),
            'proyectoGeneradoId' => $proyectoGenerado?->getId(),
        ];
    }

    public function actividad(Actividad $a): array
    {
        return [
            'id' => $a->getId(),
            'tipo' => $a->getTipo()->value,
            'familia' => $a->getTipo()->familia(),
            'texto' => $a->getTexto(),
            'objeto' => $a->getObjeto(),
            'usuario' => $this->usuario($a->getUsuario()),
            'proyecto' => $a->getProyecto() ? [
                'id' => $a->getProyecto()->getId(),
                'nombre' => $a->getProyecto()->getNombre(),
            ] : null,
            'fecha' => $this->fechaHora($a->getFecha()),
        ];
    }

    private function fecha(?\DateTimeImmutable $d): ?string
    {
        return $d?->format('Y-m-d');
    }

    private function fechaHora(?\DateTimeImmutable $d): ?string
    {
        return $d?->format(\DateTimeInterface::ATOM);
    }
}
