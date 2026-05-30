<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Service\DashboardService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/dashboard')]
class DashboardController extends AbstractController
{
    public function __construct(private DashboardService $dashboard)
    {
    }

    #[Route('/me', name: 'api_dashboard_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var Usuario $user */
        $user = $this->getUser();
        return $this->json($this->dashboard->me($user));
    }

    #[Route('/department', name: 'api_dashboard_department', methods: ['GET'])]
    public function department(): JsonResponse
    {
        return $this->json($this->dashboard->department());
    }

    #[Route('/sales', name: 'api_dashboard_sales', methods: ['GET'])]
    public function sales(): JsonResponse
    {
        return $this->json($this->dashboard->sales());
    }
}
