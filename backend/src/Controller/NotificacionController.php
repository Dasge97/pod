<?php

namespace App\Controller;

use App\Entity\Notificacion;
use App\Entity\Usuario;
use App\Repository\NotificacionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/notifications')]
class NotificacionController extends AbstractController
{
    public function __construct(
        private NotificacionRepository $repo,
        private EntityManagerInterface $em,
        #[Autowire('%env(MERCURE_PUBLIC_URL)%')] private string $mercureUrl,
    ) {
    }

    /** Datos para que el frontend se suscriba al hub de Mercure. */
    #[Route('/config', name: 'api_notifications_config', methods: ['GET'])]
    public function config(): JsonResponse
    {
        /** @var Usuario $user */
        $user = $this->getUser();
        return $this->json([
            'mercureUrl' => $this->mercureUrl,
            'topic' => 'pod/notifications/'.$user->getId(),
        ]);
    }

    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var Usuario $user */
        $user = $this->getUser();
        $notifs = $this->repo->findByUsuario($user);
        return $this->json([
            'notificaciones' => array_map(fn ($n) => $this->serializar($n), $notifs),
            'noLeidas' => $this->repo->countNoLeidas($user),
        ]);
    }

    #[Route('/unread-count', name: 'api_notifications_unread', methods: ['GET'])]
    public function unread(): JsonResponse
    {
        /** @var Usuario $user */
        $user = $this->getUser();
        return $this->json(['count' => $this->repo->countNoLeidas($user)]);
    }

    #[Route('/read-all', name: 'api_notifications_read_all', methods: ['POST'])]
    public function readAll(): JsonResponse
    {
        /** @var Usuario $user */
        $user = $this->getUser();
        $this->repo->marcarTodasLeidas($user);
        return $this->json(['count' => 0]);
    }

    #[Route('/{id}/read', name: 'api_notifications_read', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function read(Notificacion $notificacion): JsonResponse
    {
        if ($notificacion->getUsuario()?->getId() !== $this->getUser()->getId()) {
            return $this->json(['error' => 'No autorizado'], 403);
        }
        $notificacion->setLeida(true);
        $this->em->flush();
        return $this->json($this->serializar($notificacion));
    }

    private function serializar(Notificacion $n): array
    {
        $autor = $n->getAutor();
        return [
            'id' => $n->getId(),
            'texto' => $n->getTexto(),
            'tipo' => $n->getTipo(),
            'link' => $n->getLink(),
            'leida' => $n->isLeida(),
            'fecha' => $n->getFecha()->format(\DateTimeInterface::ATOM),
            'autor' => $autor ? ['nombre' => $autor->getNombre(), 'iniciales' => $autor->getIniciales(), 'color' => $autor->getColor()] : null,
        ];
    }
}
