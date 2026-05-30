<?php

namespace App\Enum;

enum TipoActividad: string
{
    case ProyectoCreado = 'proyecto_creado';
    case ProyectoActualizado = 'proyecto_actualizado';
    case TareaCreada = 'tarea_creada';
    case TareaCompletada = 'tarea_completada';
    case TareaReabierta = 'tarea_reabierta';
    case BloqueoCreado = 'bloqueo_creado';
    case BloqueoResuelto = 'bloqueo_resuelto';
    case ParticipanteAnadido = 'participante_anadido';
    case ParticipanteEliminado = 'participante_eliminado';
    case OportunidadCreada = 'oportunidad_creada';
    case OportunidadActualizada = 'oportunidad_actualizada';
    case OportunidadAceptada = 'oportunidad_aceptada';
    case OportunidadRechazada = 'oportunidad_rechazada';
    case Comentario = 'comentario';

    /** Familia visual para el frontend (icono/tono): tarea|bloqueo|estado|comentario|proyecto|oportunidad. */
    public function familia(): string
    {
        return match ($this) {
            self::TareaCreada, self::TareaCompletada, self::TareaReabierta => 'tarea',
            self::BloqueoCreado, self::BloqueoResuelto => 'bloqueo',
            self::ProyectoActualizado => 'estado',
            self::ProyectoCreado => 'proyecto',
            self::OportunidadCreada, self::OportunidadActualizada,
            self::OportunidadAceptada, self::OportunidadRechazada => 'oportunidad',
            self::ParticipanteAnadido, self::ParticipanteEliminado => 'estado',
            self::Comentario => 'comentario',
        };
    }
}
