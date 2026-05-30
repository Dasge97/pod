<?php

namespace App\Controller;

use App\Entity\Bloqueo;
use App\Enum\EstadoProyecto;
use App\Enum\Prioridad;
use App\Enum\TipoActividad;
use App\Repository\BloqueoRepository;
use App\Repository\ProyectoRepository;
use App\Repository\TareaRepository;
use App\Service\ActivityLogger;
use App\Service\Notificador;
use App\Service\Presenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/blockers')]
class BloqueoController extends AbstractController
{
    public function __construct(
        private BloqueoRepository $bloqueos,
        private ProyectoRepository $proyectos,
        private TareaRepository $tareas,
        private Presenter $presenter,
        private ActivityLogger $logger,
        private Notificador $notificador,
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_blockers_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $resuelto = $request->query->get('resuelto');
        $bloqueos = $resuelto === 'false' || $resuelto === null
            ? $this->bloqueos->findActivos()
            : $this->bloqueos->findBy([], ['fechaCreacion' => 'DESC']);

        return $this->json(array_map(fn ($b) => $this->presenter->bloqueo($b), $bloqueos));
    }

    #[Route('', name: 'api_blockers_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $d = $request->toArray();
        $proyecto = $this->proyectos->find($d['proyecto'] ?? 0);
        if (!$proyecto) {
            return $this->json(['error' => 'Proyecto no encontrado'], 404);
        }

        $bloqueo = new Bloqueo();
        $bloqueo->setProyecto($proyecto)
            ->setTitulo($d['titulo'] ?? '')
            ->setDescripcion($d['descripcion'] ?? null)
            ->setSeveridad(Prioridad::tryFrom($d['severidad'] ?? 'alta') ?? Prioridad::Alta)
            ->setCreadoPor($this->getUser());

        if (!empty($d['tarea'])) {
            $bloqueo->setTarea($this->tareas->find($d['tarea']));
        }

        // Un bloqueo activo marca el proyecto como bloqueado.
        $proyecto->setEstado(EstadoProyecto::Bloqueado);

        $this->em->persist($bloqueo);
        $this->logger->log(TipoActividad::BloqueoCreado, $this->getUser(), 'abrió un bloqueo en', $bloqueo->getTitulo(), $proyecto);
        $this->em->flush();

        if ($proyecto->getResponsable()) {
            $this->notificador->notificar($proyecto->getResponsable(), $this->getUser(), 'registró un bloqueo en «'.$proyecto->getNombre().'»', 'bloqueo', '/proyecto/'.$proyecto->getId());
        }

        return $this->json($this->presenter->bloqueo($bloqueo), 201);
    }

    #[Route('/{id}', name: 'api_blockers_update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(Bloqueo $bloqueo, Request $request): JsonResponse
    {
        $d = $request->toArray();
        if (isset($d['titulo'])) $bloqueo->setTitulo($d['titulo']);
        if (array_key_exists('descripcion', $d)) $bloqueo->setDescripcion($d['descripcion']);
        if (isset($d['severidad']) && ($s = Prioridad::tryFrom($d['severidad']))) $bloqueo->setSeveridad($s);

        if (isset($d['resuelto']) && $d['resuelto'] && !$bloqueo->isResuelto()) {
            $bloqueo->setResuelto(true)->setFechaResolucion(new \DateTimeImmutable());
            $this->logger->log(TipoActividad::BloqueoResuelto, $this->getUser(), 'resolvió el bloqueo', $bloqueo->getTitulo(), $bloqueo->getProyecto());

            // Si el proyecto no tiene más bloqueos activos, vuelve a En progreso.
            $proyecto = $bloqueo->getProyecto();
            if ($proyecto && $proyecto->getEstado() === EstadoProyecto::Bloqueado) {
                $quedanActivos = array_filter(
                    $this->bloqueos->findByProyecto($proyecto->getId()),
                    fn ($b) => !$b->isResuelto() && $b->getId() !== $bloqueo->getId()
                );
                if (count($quedanActivos) === 0) {
                    $proyecto->setEstado(EstadoProyecto::Progreso);
                }
            }
        }
        $this->em->flush();

        return $this->json($this->presenter->bloqueo($bloqueo));
    }
}
