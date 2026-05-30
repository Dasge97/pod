<?php

namespace App\Repository;

use App\Entity\Actividad;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Actividad>
 */
class ActividadRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Actividad::class);
    }

    /**
     * @param array{usuario?:int,proyecto?:int,tipo?:string,proyectoIds?:int[]} $filtros
     * @return Actividad[]
     */
    public function findFeed(array $filtros = [], int $limit = 30): array
    {
        $qb = $this->createQueryBuilder('a')
            ->leftJoin('a.usuario', 'u')->addSelect('u')
            ->leftJoin('a.proyecto', 'p')->addSelect('p')
            ->orderBy('a.fecha', 'DESC')
            ->setMaxResults($limit);

        if (!empty($filtros['usuario'])) {
            $qb->andWhere('u.id = :uid')->setParameter('uid', (int) $filtros['usuario']);
        }
        if (!empty($filtros['proyecto'])) {
            $qb->andWhere('p.id = :pid')->setParameter('pid', (int) $filtros['proyecto']);
        }
        if (!empty($filtros['proyectoIds'])) {
            $qb->andWhere('p.id IN (:pids) OR p.id IS NULL')->setParameter('pids', $filtros['proyectoIds']);
        }

        return $qb->getQuery()->getResult();
    }

    /** @return Actividad[] */
    public function findByTarea(int $tareaId, int $limit = 30): array
    {
        return $this->createQueryBuilder('a')
            ->leftJoin('a.usuario', 'u')->addSelect('u')
            ->andWhere('a.tarea = :t')->setParameter('t', $tareaId)
            ->orderBy('a.fecha', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()->getResult();
    }

    /** @return Actividad[] */
    public function findByProyecto(int $proyectoId, int $limit = 20): array
    {
        return $this->createQueryBuilder('a')
            ->leftJoin('a.usuario', 'u')->addSelect('u')
            ->andWhere('a.proyecto = :p')->setParameter('p', $proyectoId)
            ->orderBy('a.fecha', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()->getResult();
    }

    /**
     * Mapa proyectoId => última fecha de actividad, en una sola consulta.
     * @return array<int, \DateTimeImmutable>
     */
    public function ultimaActividadPorProyecto(): array
    {
        $rows = $this->createQueryBuilder('a')
            ->select('IDENTITY(a.proyecto) AS pid', 'MAX(a.fecha) AS ultima')
            ->andWhere('a.proyecto IS NOT NULL')
            ->groupBy('a.proyecto')
            ->getQuery()->getArrayResult();

        $mapa = [];
        foreach ($rows as $r) {
            $mapa[(int) $r['pid']] = new \DateTimeImmutable($r['ultima']);
        }
        return $mapa;
    }
}
