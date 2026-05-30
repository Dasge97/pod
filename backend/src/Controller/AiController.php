<?php

namespace App\Controller;

use App\Entity\Proyecto;
use App\Entity\Tarea;
use App\Enum\EstadoProyecto;
use App\Enum\Prioridad;
use App\Enum\TipoActividad;
use App\Repository\OportunidadRepository;
use App\Service\Ai\ProjectDraftGenerator;
use App\Service\ActivityLogger;
use App\Service\Presenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class AiController extends AbstractController
{
    public function __construct(
        private ProjectDraftGenerator $generator,
        private OportunidadRepository $oportunidades,
        private Presenter $presenter,
        private ActivityLogger $logger,
        private EntityManagerInterface $em,
    ) {
    }

    /** Analiza un presupuesto (texto, archivo o desde una oportunidad) y devuelve un borrador. */
    #[Route('/api/ai/analyze', name: 'api_ai_analyze', methods: ['POST'])]
    public function analyze(Request $request): JsonResponse
    {
        $texto = '';

        // 1) Archivo subido (multipart)
        $file = $request->files->get('documento');
        if ($file) {
            $texto = (string) file_get_contents($file->getPathname());
        }

        // 2) Cuerpo JSON
        if ($texto === '' && str_contains((string) $request->headers->get('Content-Type'), 'application/json')) {
            $d = $request->toArray();
            $texto = $d['texto'] ?? '';
            if ($texto === '' && !empty($d['oportunidadId'])) {
                $opp = $this->oportunidades->find($d['oportunidadId']);
                if ($opp) {
                    $texto = $this->generator->textoDeOportunidad($opp);
                }
            }
        }

        if (trim($texto) === '') {
            return $this->json(['error' => 'No se ha proporcionado texto, documento ni oportunidad.'], 400);
        }

        $borrador = $this->generator->generar($texto);

        return $this->json($borrador);
    }

    /** Crea un proyecto real a partir de un borrador ya revisado por un humano. */
    #[Route('/api/projects/from-draft', name: 'api_projects_from_draft', methods: ['POST'])]
    public function fromDraft(Request $request): JsonResponse
    {
        $d = $request->toArray();
        $proy = $d['proyecto'] ?? [];

        $proyecto = new Proyecto();
        $proyecto->setNombre($proy['nombre'] ?? 'Proyecto sin nombre')
            ->setDescripcion($proy['descripcion'] ?? null)
            ->setEstado(EstadoProyecto::Pendiente)
            ->setPrioridad(Prioridad::Media)
            ->setResponsable($this->getUser());

        if (!empty($d['oportunidadId']) && ($opp = $this->oportunidades->find($d['oportunidadId']))) {
            $proyecto->setOportunidad($opp);
            $proyecto->setCliente($opp->getCliente());
        }

        $this->em->persist($proyecto);

        // Aplanar fases → tareas
        $nTareas = 0;
        foreach ($d['fases'] ?? [] as $fase) {
            $prefijo = isset($fase['nombre']) ? '['.$fase['nombre'].'] ' : '';
            foreach ($fase['tareas'] ?? [] as $t) {
                $tarea = new Tarea();
                $tarea->setProyecto($proyecto)
                    ->setTitulo($prefijo.($t['titulo'] ?? 'Tarea'))
                    ->setEstado(\App\Enum\EstadoTarea::Pendiente)
                    ->setPrioridad(Prioridad::Media)
                    ->setEstimacionHoras(isset($t['estimacionHoras']) ? (float) $t['estimacionHoras'] : null);
                $this->em->persist($tarea);
                $nTareas++;
            }
        }

        $this->logger->log(TipoActividad::ProyectoCreado, $this->getUser(), 'creó el proyecto (desde IA)', $proyecto->getNombre(), $proyecto);
        $this->em->flush();

        $data = $this->presenter->proyectoDetalle($proyecto);
        $data['tareasCreadas'] = $nTareas;

        return $this->json($data, 201);
    }
}
