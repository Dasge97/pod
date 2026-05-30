<?php

namespace App\Repository;

use App\Entity\Bloqueo;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Bloqueo>
 */
class BloqueoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Bloqueo::class);
    }

    /** @return Bloqueo[] */
    public function findActivos(): array
    {
        return $this->createQueryBuilder('b')
            ->leftJoin('b.proyecto', 'p')->addSelect('p')
            ->leftJoin('b.creadoPor', 'c')->addSelect('c')
            ->andWhere('b.resuelto = false')
            ->orderBy('b.fechaCreacion', 'ASC')
            ->getQuery()->getResult();
    }

    /** @return Bloqueo[] */
    public function findByProyecto(int $proyectoId): array
    {
        return $this->createQueryBuilder('b')
            ->leftJoin('b.creadoPor', 'c')->addSelect('c')
            ->andWhere('b.proyecto = :p')->setParameter('p', $proyectoId)
            ->orderBy('b.resuelto', 'ASC')
            ->addOrderBy('b.fechaCreacion', 'DESC')
            ->getQuery()->getResult();
    }
}
