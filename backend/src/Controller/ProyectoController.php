<?php

namespace App\Controller;

use App\Entity\Proyecto;
use App\Entity\ProyectoUsuario;
use App\Enum\EstadoProyecto;
use App\Enum\Prioridad;
use App\Enum\RolProyecto;
use App\Enum\TipoActividad;
use App\Repository\ActividadRepository;
use App\Repository\BloqueoRepository;
use App\Repository\ProyectoRepository;
use App\Repository\ProyectoUsuarioRepository;
use App\Repository\TareaRepository;
use App\Repository\UsuarioRepository;
use App\Service\ActivityLogger;
use App\Service\Presenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/projects')]
class ProyectoController extends AbstractController
{
    public function __construct(
        private ProyectoRepository $proyectos,
        private TareaRepository $tareas,
        private BloqueoRepository $bloqueos,
        private ProyectoUsuarioRepository $participantes,
        private ActividadRepository $actividad,
        private UsuarioRepository $usuarios,
        private Presenter $presenter,
        private ActivityLogger $logger,
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_projects_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $filtros = $request->query->all();
        $proyectos = $this->proyectos->findByFiltros($filtros);
        $mapa = $this->actividad->ultimaActividadPorProyecto();

        return $this->json(array_map(function (Proyecto $p) use ($mapa) {
            $ultima = $mapa[$p->getId()] ?? $p->getFechaCreacion();
            return $this->presenter->proyectoLite($p, (int) $ultima->diff(new \DateTimeImmutable())->days);
        }, $proyectos));
    }

    #[Route('/{id}', name: 'api_projects_get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function get(Proyecto $proyecto): JsonResponse
    {
        $mapa = $this->actividad->ultimaActividadPorProyecto();
        $ultima = $mapa[$proyecto->getId()] ?? $proyecto->getFechaCreacion();
        return $this->json($this->presenter->proyectoDetalle($proyecto, (int) $ultima->diff(new \DateTimeImmutable())->days));
    }

    #[Route('', name: 'api_projects_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PROJECT_MANAGER');
        $d = $request->toArray();
        $proyecto = new Proyecto();
        $this->aplicar($proyecto, $d);

        if ($proyecto->getResponsable() === null) {
            $proyecto->setResponsable($this->getUser());
        }

        $this->em->persist($proyecto);

        // El responsable forma parte del proyecto desde el inicio.
        $pu = new ProyectoUsuario();
        $pu->setProyecto($proyecto)->setUsuario($proyecto->getResponsable())->setRol(RolProyecto::Responsable);
        $this->em->persist($pu);

        $this->logger->log(TipoActividad::ProyectoCreado, $this->getUser(), 'creó el proyecto', $proyecto->getNombre(), $proyecto);
        $this->em->flush();

        return $this->json($this->presenter->proyectoDetalle($proyecto), 201);
    }

    #[Route('/{id}', name: 'api_projects_update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(Proyecto $proyecto, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PROJECT_MANAGER');
        $this->aplicar($proyecto, $request->toArray());
        $this->logger->log(TipoActividad::ProyectoActualizado, $this->getUser(), 'actualizó el proyecto', $proyecto->getNombre(), $proyecto);
        $this->em->flush();

        return $this->json($this->presenter->proyectoDetalle($proyecto));
    }

    #[Route('/{id}/tasks', name: 'api_projects_tasks', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function tasks(Proyecto $proyecto): JsonResponse
    {
        $tareas = $this->tareas->findByProyecto($proyecto->getId());
        return $this->json(array_map(fn ($t) => $this->presenter->tarea($t, false), $tareas));
    }

    #[Route('/{id}/blockers', name: 'api_projects_blockers', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function blockers(Proyecto $proyecto): JsonResponse
    {
        $bloqueos = $this->bloqueos->findByProyecto($proyecto->getId());
        return $this->json(array_map(fn ($b) => $this->presenter->bloqueo($b), $bloqueos));
    }

    #[Route('/{id}/members', name: 'api_projects_members', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function members(Proyecto $proyecto): JsonResponse
    {
        $parts = $this->participantes->findByProyecto($proyecto->getId());
        return $this->json(array_map(fn ($pu) => $this->presenter->participante($pu), $parts));
    }

    #[Route('/{id}/members', name: 'api_projects_members_add', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function addMember(Proyecto $proyecto, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PROJECT_MANAGER');
        $d = $request->toArray();
        $usuario = $this->usuarios->find($d['usuario'] ?? 0);
        if (!$usuario) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }
        $existente = $this->participantes->findUno($proyecto, $usuario);
        $pu = $existente ?? new ProyectoUsuario();
        $pu->setProyecto($proyecto)->setUsuario($usuario)
            ->setRol(RolProyecto::tryFrom($d['rol'] ?? 'colaborador') ?? RolProyecto::Colaborador);

        if (!$existente) {
            $this->em->persist($pu);
            $this->logger->log(TipoActividad::ParticipanteAnadido, $this->getUser(), 'añadió a', $usuario->getNombre(), $proyecto);
        }
        $this->em->flush();

        return $this->json($this->presenter->participante($pu), $existente ? 200 : 201);
    }

    #[Route('/{id}/members/{usuarioId}', name: 'api_projects_members_remove', methods: ['DELETE'], requirements: ['id' => '\d+', 'usuarioId' => '\d+'])]
    public function removeMember(Proyecto $proyecto, int $usuarioId): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PROJECT_MANAGER');
        $usuario = $this->usuarios->find($usuarioId);
        if ($usuario && ($pu = $this->participantes->findUno($proyecto, $usuario))) {
            $this->em->remove($pu);
            $this->logger->log(TipoActividad::ParticipanteEliminado, $this->getUser(), 'eliminó a', $usuario->getNombre(), $proyecto);
            $this->em->flush();
        }
        return $this->json(null, 204);
    }

    #[Route('/{id}/activity', name: 'api_projects_activity', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function activity(Proyecto $proyecto): JsonResponse
    {
        $feed = $this->actividad->findByProyecto($proyecto->getId());
        return $this->json(array_map(fn ($a) => $this->presenter->actividad($a), $feed));
    }

    #[Route('/{id}/comments', name: 'api_projects_comment', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function comment(Proyecto $proyecto, Request $request): JsonResponse
    {
        $texto = trim($request->toArray()['texto'] ?? '');
        if ($texto === '') {
            return $this->json(['error' => 'El comentario está vacío.'], 400);
        }
        $act = $this->logger->log(TipoActividad::Comentario, $this->getUser(), 'comentó:', $texto, $proyecto);
        $this->em->flush();

        return $this->json($this->presenter->actividad($act), 201);
    }

    /** Aplica los campos editables de un payload a la entidad. */
    private function aplicar(Proyecto $p, array $d): void
    {
        if (isset($d['nombre'])) $p->setNombre($d['nombre']);
        if (isset($d['cliente'])) $p->setCliente($d['cliente']);
        if (array_key_exists('descripcion', $d)) $p->setDescripcion($d['descripcion']);
        if (isset($d['estado']) && ($e = EstadoProyecto::tryFrom($d['estado']))) $p->setEstado($e);
        if (isset($d['prioridad']) && ($pr = Prioridad::tryFrom($d['prioridad']))) $p->setPrioridad($pr);
        if (isset($d['progreso'])) $p->setProgreso((int) $d['progreso']);
        if (isset($d['responsable'])) {
            $u = $this->usuarios->find($d['responsable']);
            if ($u) $p->setResponsable($u);
        }
        if (array_key_exists('fechaInicio', $d)) $p->setFechaInicio($this->parseDate($d['fechaInicio']));
        if (array_key_exists('fechaFinEstimada', $d)) $p->setFechaFinEstimada($this->parseDate($d['fechaFinEstimada']));
        if (array_key_exists('fechaFinReal', $d)) $p->setFechaFinReal($this->parseDate($d['fechaFinReal']));
    }

    private function parseDate(?string $v): ?\DateTimeImmutable
    {
        return $v ? new \DateTimeImmutable($v) : null;
    }
}
