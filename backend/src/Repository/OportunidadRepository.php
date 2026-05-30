<?php

namespace App\Repository;

use App\Entity\Oportunidad;
use App\Enum\EstadoOportunidad;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Oportunidad>
 */
class OportunidadRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Oportunidad::class);
    }

    /**
     * @param array{estado?:string,responsable?:int,q?:string} $filtros
     * @return Oportunidad[]
     */
    public function findByFiltros(array $filtros = []): array
    {
        $qb = $this->createQueryBuilder('o')
            ->leftJoin('o.responsableComercial', 'r')->addSelect('r')
            ->orderBy('o.importe', 'DESC');

        if (!empty($filtros['estado']) && ($e = EstadoOportunidad::tryFrom($filtros['estado']))) {
            $qb->andWhere('o.estado = :estado')->setParameter('estado', $e);
        }
        if (!empty($filtros['responsable'])) {
            $qb->andWhere('r.id = :resp')->setParameter('resp', (int) $filtros['responsable']);
        }
        if (!empty($filtros['q'])) {
            $qb->andWhere('o.cliente LIKE :q OR o.nombre LIKE :q')->setParameter('q', '%'.$filtros['q'].'%');
        }

        return $qb->getQuery()->getResult();
    }

    /** @return Oportunidad[] */
    public function findAllOrdenadas(): array
    {
        return $this->createQueryBuilder('o')
            ->leftJoin('o.responsableComercial', 'r')->addSelect('r')
            ->orderBy('o.importe', 'DESC')
            ->getQuery()->getResult();
    }
}
