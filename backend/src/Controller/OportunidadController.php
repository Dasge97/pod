<?php

namespace App\Controller;

use App\Entity\Oportunidad;
use App\Enum\EstadoOportunidad;
use App\Enum\TipoActividad;
use App\Repository\OportunidadRepository;
use App\Repository\UsuarioRepository;
use App\Service\ActivityLogger;
use App\Service\Presenter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/opportunities')]
class OportunidadController extends AbstractController
{
    public function __construct(
        private OportunidadRepository $oportunidades,
        private UsuarioRepository $usuarios,
        private Presenter $presenter,
        private ActivityLogger $logger,
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_opportunities_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $oportunidades = $this->oportunidades->findByFiltros($request->query->all());
        return $this->json(array_map(fn ($o) => $this->presenter->oportunidad($o), $oportunidades));
    }

    #[Route('/{id}', name: 'api_opportunities_get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function get(Oportunidad $oportunidad): JsonResponse
    {
        return $this->json($this->presenter->oportunidad($oportunidad));
    }

    #[Route('', name: 'api_opportunities_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $o = new Oportunidad();
        $this->aplicar($o, $request->toArray());
        if ($o->getResponsableComercial() === null) {
            $o->setResponsableComercial($this->getUser());
        }

        $this->em->persist($o);
        $this->logger->log(TipoActividad::OportunidadCreada, $this->getUser(), 'creó la oportunidad', $o->getCliente().' — '.$o->getNombre());
        $this->em->flush();

        return $this->json($this->presenter->oportunidad($o), 201);
    }

    #[Route('/{id}', name: 'api_opportunities_update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(Oportunidad $o, Request $request): JsonResponse
    {
        $estadoPrevio = $o->getEstado();
        $this->aplicar($o, $request->toArray());

        if ($estadoPrevio !== $o->getEstado()) {
            $o->setFechaUltimaAccion(new \DateTimeImmutable());
            $tipo = match ($o->getEstado()) {
                EstadoOportunidad::Aceptado => TipoActividad::OportunidadAceptada,
                EstadoOportunidad::Rechazado => TipoActividad::OportunidadRechazada,
                default => TipoActividad::OportunidadActualizada,
            };
            $this->logger->log($tipo, $this->getUser(), 'movió a «'.$o->getEstado()->label().'»', $o->getCliente().' — '.$o->getNombre());
        }
        $this->em->flush();

        return $this->json($this->presenter->oportunidad($o));
    }

    #[Route('/{id}/follow-up', name: 'api_opportunities_followup', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function followUp(Oportunidad $o, Request $request): JsonResponse
    {
        $nota = $request->toArray()['nota'] ?? 'seguimiento registrado';
        $o->setFechaUltimaAccion(new \DateTimeImmutable());
        $this->logger->log(TipoActividad::OportunidadActualizada, $this->getUser(), 'registró seguimiento: '.$nota, $o->getCliente());
        $this->em->flush();

        return $this->json($this->presenter->oportunidad($o));
    }

    private function aplicar(Oportunidad $o, array $d): void
    {
        if (isset($d['nombre'])) $o->setNombre($d['nombre']);
        if (isset($d['cliente'])) $o->setCliente($d['cliente']);
        if (array_key_exists('descripcion', $d)) $o->setDescripcion($d['descripcion']);
        if (isset($d['importe'])) $o->setImporte((float) $d['importe']);
        if (isset($d['probabilidad'])) $o->setProbabilidad((int) $d['probabilidad']);
        if (isset($d['estado']) && ($e = EstadoOportunidad::tryFrom($d['estado']))) $o->setEstado($e);
        if (array_key_exists('fechaEnvio', $d)) $o->setFechaEnvio($d['fechaEnvio'] ? new \DateTimeImmutable($d['fechaEnvio']) : null);
        if (isset($d['responsable'])) {
            $u = $this->usuarios->find($d['responsable']);
            if ($u) $o->setResponsableComercial($u);
        }
    }
}
