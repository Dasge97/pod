<?php

namespace App\Repository;

use App\Entity\Proyecto;
use App\Entity\ProyectoUsuario;
use App\Entity\Usuario;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProyectoUsuario>
 */
class ProyectoUsuarioRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProyectoUsuario::class);
    }

    /** @return ProyectoUsuario[] */
    public function findByProyecto(int $proyectoId): array
    {
        return $this->createQueryBuilder('pu')
            ->leftJoin('pu.usuario', 'u')->addSelect('u')
            ->andWhere('pu.proyecto = :p')->setParameter('p', $proyectoId)
            ->getQuery()->getResult();
    }

    public function findUno(Proyecto $proyecto, Usuario $usuario): ?ProyectoUsuario
    {
        return $this->findOneBy(['proyecto' => $proyecto, 'usuario' => $usuario]);
    }

    public function countProyectosDeUsuario(Usuario $usuario): int
    {
        return (int) $this->createQueryBuilder('pu')
            ->select('COUNT(DISTINCT pu.proyecto)')
            ->andWhere('pu.usuario = :u')->setParameter('u', $usuario)
            ->getQuery()->getSingleScalarResult();
    }
}
