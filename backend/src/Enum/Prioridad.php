<?php

namespace App\Enum;

enum Prioridad: string
{
    case Baja = 'baja';
    case Media = 'media';
    case Alta = 'alta';
    case Critica = 'critica';

    public function label(): string
    {
        return match ($this) {
            self::Baja => 'Baja',
            self::Media => 'Media',
            self::Alta => 'Alta',
            self::Critica => 'Crítica',
        };
    }

    /** Peso para ordenar por prioridad (0 = más urgente). */
    public function peso(): int
    {
        return match ($this) {
            self::Critica => 0,
            self::Alta => 1,
            self::Media => 2,
            self::Baja => 3,
        };
    }
}
