<?php

namespace App\Controller;

use App\Repository\TareaRepository;
use App\Repository\UsuarioRepository;
use App\Service\Presenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users')]
class UsuarioController extends AbstractController
{
    public function __construct(
        private UsuarioRepository $usuarios,
        private TareaRepository $tareas,
        private Presenter $presenter,
    ) {
    }

    #[Route('', name: 'api_users_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(array_map(fn ($u) => $this->presenter->usuario($u), $this->usuarios->findActivos()));
    }

    #[Route('/{id}', name: 'api_users_get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function get(int $id): JsonResponse
    {
        $u = $this->usuarios->find($id);
        if (!$u) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }
        $abiertas = $this->tareas->countAbiertasPorUsuario($u);
        $data = $this->presenter->usuario($u);
        $data['tareasAbiertas'] = $abiertas;
        $data['carga'] = min(100, $abiertas * 14);

        return $this->json($data);
    }
}
