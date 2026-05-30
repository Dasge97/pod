<?php

namespace App\Enum;

enum EstadoOportunidad: string
{
    case Borrador = 'borrador';
    case Enviado = 'enviado';
    case Negociacion = 'negociacion';
    case Aceptado = 'aceptado';
    case Rechazado = 'rechazado';
    case SinRespuesta = 'sin_respuesta';

    public function label(): string
    {
        return match ($this) {
            self::Borrador => 'Borrador',
            self::Enviado => 'Enviado',
            self::Negociacion => 'En negociación',
            self::Aceptado => 'Aceptado',
            self::Rechazado => 'Rechazado',
            self::SinRespuesta => 'Sin respuesta',
        };
    }

    public function esAbierta(): bool
    {
        return $this !== self::Aceptado && $this !== self::Rechazado;
    }
}
