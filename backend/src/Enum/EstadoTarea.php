<?php

namespace App\Enum;

enum EstadoTarea: string
{
    case Pendiente = 'pendiente';
    case Progreso = 'progreso';
    case Bloqueada = 'bloqueada';
    case Finalizada = 'finalizada';

    public function label(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::Progreso => 'En progreso',
            self::Bloqueada => 'Bloqueada',
            self::Finalizada => 'Finalizada',
        };
    }
}
