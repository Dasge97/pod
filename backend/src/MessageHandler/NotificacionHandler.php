<?php

namespace App\MessageHandler;

use App\Entity\Notificacion;
use App\Message\NotificacionMessage;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

/**
 * Persiste la notificación y la publica en tiempo real al hub de Mercure,
 * en el topic privado del destinatario.
 */
#[AsMessageHandler]
class NotificacionHandler
{
    public function __construct(
        private UsuarioRepository $usuarios,
        private EntityManagerInterface $em,
        private HubInterface $hub,
    ) {
    }

    public function __invoke(NotificacionMessage $msg): void
    {
        $destinatario = $this->usuarios->find($msg->destinatarioId);
        if (!$destinatario) {
            return;
        }

        $notif = new Notificacion();
        $notif->setUsuario($destinatario)
            ->setAutor($msg->autorId ? $this->usuarios->find($msg->autorId) : null)
            ->setTexto($msg->texto)
            ->setTipo($msg->tipo)
            ->setLink($msg->link);

        $this->em->persist($notif);
        $this->em->flush();

        // Publicación en tiempo real (Server-Sent Events).
        try {
            $this->hub->publish(new Update(
                'pod/notifications/'.$destinatario->getId(),
                (string) json_encode([
                    'id' => $notif->getId(),
                    'texto' => $notif->getTexto(),
                    'tipo' => $notif->getTipo(),
                    'link' => $notif->getLink(),
                    'autor' => $notif->getAutor()?->getNombre(),
                    'fecha' => $notif->getFecha()->format(\DateTimeInterface::ATOM),
                    'leida' => false,
                ]),
            ));
        } catch (\Throwable) {
            // Si el hub no está disponible, la notificación queda persistida igualmente.
        }
    }
}
