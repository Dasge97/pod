<?php

namespace App\Message;

/**
 * Mensaje de Messenger para crear y enviar una notificación.
 * Se procesa de forma síncrona por defecto; configurando un transport async
 * en messenger.yaml pasa a procesarse en segundo plano por un worker.
 */
final class NotificacionMessage
{
    public function __construct(
        public readonly int $destinatarioId,
        public readonly ?int $autorId,
        public readonly string $texto,
        public readonly string $tipo,
        public readonly ?string $link = null,
    ) {
    }
}
