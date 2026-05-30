<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Service\Presenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    /**
     * Punto de entrada del login. El cuerpo (email/password) lo procesa el
     * authenticator json_login del firewall, que emite el JWT. Este método no
     * llega a ejecutarse: solo existe para registrar la ruta.
     */
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        throw new \LogicException('Esta ruta la gestiona el authenticator JWT (json_login).');
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(Presenter $presenter): JsonResponse
    {
        /** @var Usuario $user */
        $user = $this->getUser();
        return $this->json($presenter->usuario($user));
    }
}
