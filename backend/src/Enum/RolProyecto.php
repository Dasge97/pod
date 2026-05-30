<?php

namespace App\Enum;

enum RolProyecto: string
{
    case Responsable = 'responsable';
    case Colaborador = 'colaborador';
    case Consultado = 'consultado';

    public function label(): string
    {
        return match ($this) {
            self::Responsable => 'Responsable',
            self::Colaborador => 'Colaborador',
            self::Consultado => 'Consultado',
        };
    }
}
