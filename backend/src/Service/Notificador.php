<?php

namespace App\Service;

use App\Entity\Usuario;
use App\Message\NotificacionMessage;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Fachada para emitir notificaciones. Despacha un mensaje por Messenger que se
 * encarga de persistir y publicar a Mercure (ver NotificacionHandler).
 */
class Notificador
{
    public function __construct(private MessageBusInterface $bus)
    {
    }

    public function notificar(Usuario $destinatario, ?Usuario $autor, string $texto, string $tipo, ?string $link = null): void
    {
        // No te notifiques a ti mismo de tus propias acciones.
        if ($autor && $autor->getId() === $destinatario->getId()) {
            return;
        }
        $this->bus->dispatch(new NotificacionMessage($destinatario->getId(), $autor?->getId(), $texto, $tipo, $link));
    }

    /**
     * Notifica a varios destinatarios sin duplicados.
     * @param array<?Usuario> $destinatarios
     */
    public function notificarVarios(array $destinatarios, ?Usuario $autor, string $texto, string $tipo, ?string $link = null): void
    {
        $vistos = [];
        foreach ($destinatarios as $d) {
            if ($d === null || in_array($d->getId(), $vistos, true)) {
                continue;
            }
            $vistos[] = $d->getId();
            $this->notificar($d, $autor, $texto, $tipo, $link);
        }
    }
}
