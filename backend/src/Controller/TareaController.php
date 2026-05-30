<?php

namespace App\Controller;

use App\Entity\Proyecto;
use App\Entity\ProyectoUsuario;
use App\Entity\Tarea;
use App\Entity\Usuario;
use App\Enum\EstadoTarea;
use App\Enum\Prioridad;
use App\Enum\RolProyecto;
use App\Enum\TipoActividad;
use App\Repository\ProyectoRepository;
use App\Repository\ProyectoUsuarioRepository;
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
        private ProyectoUsuarioRepository $participantes,
        private UsuarioRepository $usuarios,
        private Presenter $presenter,
        private ActivityLogger $logger,
        private EntityManagerInterface $em,
    ) {
    }

    /**
     * Asignar una tarea a otra persona (no a uno mismo) requiere ser responsable.
     * Devuelve una respuesta de error si no se permite, o null si está OK.
     */
    private function verificarAsignacion(?Usuario $asignado): ?JsonResponse
    {
        if ($asignado === null || $asignado->getId() === $this->getUser()->getId() || $this->isGranted('ROLE_PROJECT_MANAGER')) {
            return null;
        }
        return $this->json(['error' => 'Solo los responsables pueden asignar tareas a otras personas.'], 403);
    }

    /**
     * Garantiza que quien tiene una tarea asignada forma parte del proyecto.
     * Si no participa, se añade automáticamente como Colaborador.
     */
    private function asegurarParticipacion(Proyecto $proyecto, ?Usuario $usuario): void
    {
        if ($usuario === null || $this->participantes->findUno($proyecto, $usuario) !== null) {
            return;
        }
        $pu = new ProyectoUsuario();
        $pu->setProyecto($proyecto)->setUsuario($usuario)->setRol(RolProyecto::Colaborador);
        $this->em->persist($pu);
        $this->logger->log(TipoActividad::ParticipanteAnadido, $this->getUser(), 'añadió al proyecto a', $usuario->getNombre(), $proyecto);
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

        if ($error = $this->verificarAsignacion($tarea->getAsignado())) {
            return $error;
        }

        $this->em->persist($tarea);
        $this->asegurarParticipacion($proyecto, $tarea->getAsignado());
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
        $asignadoPrevio = $tarea->getAsignado();
        $estadoPrevio = $tarea->getEstado();
        $this->aplicar($tarea, $request->toArray());

        // Reasignar a otra persona (distinta de la anterior y de uno mismo) requiere ser responsable.
        if ($tarea->getAsignado() !== $asignadoPrevio && ($error = $this->verificarAsignacion($tarea->getAsignado()))) {
            return $error;
        }
        $this->asegurarParticipacion($tarea->getProyecto(), $tarea->getAsignado());

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
