<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Enum\RolUsuario;
use App\Repository\TareaRepository;
use App\Repository\UsuarioRepository;
use App\Service\DashboardService;
use App\Service\Presenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users')]
class UsuarioController extends AbstractController
{
    private const COLORES = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500', 'bg-fuchsia-500'];

    public function __construct(
        private UsuarioRepository $usuarios,
        private TareaRepository $tareas,
        private Presenter $presenter,
        private DashboardService $dashboard,
        private UserPasswordHasherInterface $hasher,
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_users_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        // El admin puede pedir también los inactivos (para la gestión de usuarios).
        $usuarios = ($request->query->getBoolean('todos') && $this->isGranted('ROLE_ADMIN'))
            ? $this->usuarios->findBy([], ['nombre' => 'ASC'])
            : $this->usuarios->findActivos();

        return $this->json(array_map(fn ($u) => $this->presenter->usuario($u), $usuarios));
    }

    #[Route('', name: 'api_users_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $d = $request->toArray();

        if (empty($d['email']) || empty($d['nombre']) || empty($d['password'])) {
            return $this->json(['error' => 'Nombre, email y contraseña son obligatorios.'], 400);
        }
        if ($this->usuarios->findOneBy(['email' => $d['email']])) {
            return $this->json(['error' => 'Ya existe un usuario con ese email.'], 409);
        }

        $u = new Usuario();
        $u->setNombre($d['nombre'])
            ->setEmail($d['email'])
            ->setRol(RolUsuario::tryFrom($d['rol'] ?? 'developer') ?? RolUsuario::Developer)
            ->setColor(self::COLORES[count($this->usuarios->findAll()) % count(self::COLORES)]);
        $u->setPassword($this->hasher->hashPassword($u, $d['password']));

        $this->em->persist($u);
        $this->em->flush();

        return $this->json($this->presenter->usuario($u), 201);
    }

    #[Route('/{id}', name: 'api_users_update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $u = $this->usuarios->find($id);
        if (!$u) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }
        $d = $request->toArray();

        if (isset($d['nombre'])) $u->setNombre($d['nombre']);
        if (isset($d['email'])) $u->setEmail($d['email']);
        if (isset($d['rol']) && ($r = RolUsuario::tryFrom($d['rol']))) $u->setRol($r);
        if (isset($d['activo'])) $u->setActivo((bool) $d['activo']);
        if (!empty($d['password'])) $u->setPassword($this->hasher->hashPassword($u, $d['password']));

        $this->em->flush();

        return $this->json($this->presenter->usuario($u));
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

    #[Route('/{id}/overview', name: 'api_users_overview', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function overview(int $id): JsonResponse
    {
        $u = $this->usuarios->find($id);
        if (!$u) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }
        return $this->json($this->dashboard->personaOverview($u));
    }
}
