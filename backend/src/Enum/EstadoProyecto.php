<?php

namespace App\Enum;

enum EstadoProyecto: string
{
    case Pendiente = 'pendiente';
    case Progreso = 'progreso';
    case Bloqueado = 'bloqueado';
    case Revision = 'revision';
    case Finalizado = 'finalizado';

    public function label(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::Progreso => 'En progreso',
            self::Bloqueado => 'Bloqueado',
            self::Revision => 'En revisión',
            self::Finalizado => 'Finalizado',
        };
    }
}
