<?php

namespace App\Controller;

use App\Entity\Tarea;
use App\Enum\EstadoTarea;
use App\Enum\Prioridad;
use App\Enum\TipoActividad;
use App\Repository\ProyectoRepository;
use App\Repository\UsuarioRepository;
use App\Service\ActivityLogger;
use App\Service\Presenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/tasks')]
class TareaController extends AbstractController
{
    public function __construct(
        private ProyectoRepository $proyectos,
        private UsuarioRepository $usuarios,
        private Presenter $presenter,
        private ActivityLogger $logger,
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_tasks_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $d = $request->toArray();
        $proyecto = $this->proyectos->find($d['proyecto'] ?? 0);
        if (!$proyecto) {
            return $this->json(['error' => 'Proyecto no encontrado'], 404);
        }

        $tarea = new Tarea();
        $tarea->setProyecto($proyecto);
        $this->aplicar($tarea, $d);

        $this->em->persist($tarea);
        $this->logger->log(TipoActividad::TareaCreada, $this->getUser(), 'creó la tarea', $tarea->getTitulo(), $proyecto);
        $this->em->flush();

        return $this->json($this->presenter->tarea($tarea), 201);
    }

    #[Route('/{id}', name: 'api_tasks_get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function get(Tarea $tarea): JsonResponse
    {
        return $this->json($this->presenter->tarea($tarea));
    }

    #[Route('/{id}', name: 'api_tasks_update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(Tarea $tarea, Request $request): JsonResponse
    {
        $estadoPrevio = $tarea->getEstado();
        $this->aplicar($tarea, $request->toArray());

        if ($estadoPrevio !== EstadoTarea::Finalizada && $tarea->getEstado() === EstadoTarea::Finalizada) {
            $this->logger->log(TipoActividad::TareaCompletada, $this->getUser(), 'completó', $tarea->getTitulo(), $tarea->getProyecto());
        }
        $this->em->flush();

        return $this->json($this->presenter->tarea($tarea));
    }

    #[Route('/{id}', name: 'api_tasks_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(Tarea $tarea): JsonResponse
    {
        $this->em->remove($tarea);
        $this->em->flush();
        return $this->json(null, 204);
    }

    private function aplicar(Tarea $t, array $d): void
    {
        if (isset($d['titulo'])) $t->setTitulo($d['titulo']);
        if (array_key_exists('descripcion', $d)) $t->setDescripcion($d['descripcion']);
        if (isset($d['estado']) && ($e = EstadoTarea::tryFrom($d['estado']))) $t->setEstado($e);
        if (isset($d['prioridad']) && ($p = Prioridad::tryFrom($d['prioridad']))) $t->setPrioridad($p);
        if (array_key_exists('estimacionHoras', $d)) $t->setEstimacionHoras($d['estimacionHoras'] !== null ? (float) $d['estimacionHoras'] : null);
        if (isset($d['horasConsumidas'])) $t->setHorasConsumidas((float) $d['horasConsumidas']);
        if (array_key_exists('fechaLimite', $d)) $t->setFechaLimite($d['fechaLimite'] ? new \DateTimeImmutable($d['fechaLimite']) : null);
        if (array_key_exists('asignado', $d)) {
            $t->setAsignado($d['asignado'] ? $this->usuarios->find($d['asignado']) : null);
        }
    }
}
