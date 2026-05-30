<?php

namespace App\Repository;

use App\Entity\Tarea;
use App\Entity\Usuario;
use App\Enum\EstadoTarea;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Tarea>
 */
class TareaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Tarea::class);
    }

    /** @return Tarea[] */
    public function findByProyecto(int $proyectoId): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.asignado', 'a')->addSelect('a')
            ->andWhere('t.proyecto = :p')->setParameter('p', $proyectoId)
            ->orderBy('t.fechaCreacion', 'ASC')
            ->getQuery()->getResult();
    }

    /**
     * Tareas abiertas (no finalizadas) asignadas a un usuario.
     * @return Tarea[]
     */
    public function findAbiertasDeUsuario(Usuario $usuario): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.proyecto', 'p')->addSelect('p')
            ->andWhere('t.asignado = :u')->setParameter('u', $usuario)
            ->andWhere('t.estado != :fin')->setParameter('fin', EstadoTarea::Finalizada)
            ->getQuery()->getResult();
    }

    /** @return Tarea[] */
    public function findVencidas(): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.proyecto', 'p')->addSelect('p')
            ->andWhere('t.estado != :fin')->setParameter('fin', EstadoTarea::Finalizada)
            ->andWhere('t.fechaLimite IS NOT NULL')
            ->andWhere('t.fechaLimite < :hoy')->setParameter('hoy', new \DateTimeImmutable('today'))
            ->getQuery()->getResult();
    }

    public function countAbiertasPorUsuario(Usuario $usuario): int
    {
        return (int) $this->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->andWhere('t.asignado = :u')->setParameter('u', $usuario)
            ->andWhere('t.estado != :fin')->setParameter('fin', EstadoTarea::Finalizada)
            ->getQuery()->getSingleScalarResult();
    }
}
