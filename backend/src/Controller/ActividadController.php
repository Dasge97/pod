<?php

namespace App\Controller;

use App\Repository\ActividadRepository;
use App\Service\Presenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ActividadController extends AbstractController
{
    #[Route('/api/activity', name: 'api_activity', methods: ['GET'])]
    public function feed(Request $request, ActividadRepository $repo, Presenter $presenter): JsonResponse
    {
        $limit = min(100, max(1, (int) $request->query->get('limit', 30)));
        $feed = $repo->findFeed($request->query->all(), $limit);
        return $this->json(array_map(fn ($a) => $presenter->actividad($a), $feed));
    }
}
