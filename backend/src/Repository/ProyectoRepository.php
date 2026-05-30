<?php

namespace App\Repository;

use App\Entity\Proyecto;
use App\Entity\Usuario;
use App\Enum\EstadoProyecto;
use App\Enum\Prioridad;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Proyecto>
 */
class ProyectoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Proyecto::class);
    }

    /**
     * @param array{estado?:string,prioridad?:string,responsable?:int,activo?:bool} $filtros
     * @return Proyecto[]
     */
    public function findByFiltros(array $filtros = []): array
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.responsable', 'r')->addSelect('r')
            ->orderBy('p.fechaCreacion', 'DESC');

        if (!empty($filtros['estado']) && ($e = EstadoProyecto::tryFrom($filtros['estado']))) {
            $qb->andWhere('p.estado = :estado')->setParameter('estado', $e);
        }
        if (!empty($filtros['prioridad']) && ($pr = Prioridad::tryFrom($filtros['prioridad']))) {
            $qb->andWhere('p.prioridad = :prioridad')->setParameter('prioridad', $pr);
        }
        if (!empty($filtros['responsable'])) {
            $qb->andWhere('r.id = :resp')->setParameter('resp', (int) $filtros['responsable']);
        }
        if (isset($filtros['activo'])) {
            $qb->andWhere('p.activo = :activo')->setParameter('activo', (bool) $filtros['activo']);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Proyectos en los que participa un usuario (como responsable o participante).
     * @return Proyecto[]
     */
    public function findByParticipante(Usuario $usuario): array
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.participantes', 'pu')
            ->andWhere('pu.usuario = :u OR p.responsable = :u')
            ->setParameter('u', $usuario)
            ->distinct()
            ->orderBy('p.fechaCreacion', 'DESC')
            ->getQuery()->getResult();
    }

    /** @return Proyecto[] */
    public function findAllConRelaciones(): array
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.responsable', 'r')->addSelect('r')
            ->getQuery()->getResult();
    }

    public function countByEstado(EstadoProyecto $estado): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->andWhere('p.estado = :e')->setParameter('e', $estado)
            ->getQuery()->getSingleScalarResult();
    }
}
