<?php

namespace App\Repository;

use App\Entity\Notificacion;
use App\Entity\Usuario;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notificacion>
 */
class NotificacionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notificacion::class);
    }

    /** @return Notificacion[] */
    public function findByUsuario(Usuario $usuario, int $limit = 40): array
    {
        return $this->createQueryBuilder('n')
            ->leftJoin('n.autor', 'a')->addSelect('a')
            ->andWhere('n.usuario = :u')->setParameter('u', $usuario)
            ->orderBy('n.fecha', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()->getResult();
    }

    public function countNoLeidas(Usuario $usuario): int
    {
        return (int) $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->andWhere('n.usuario = :u')->setParameter('u', $usuario)
            ->andWhere('n.leida = false')
            ->getQuery()->getSingleScalarResult();
    }

    public function marcarTodasLeidas(Usuario $usuario): void
    {
        $this->createQueryBuilder('n')
            ->update()
            ->set('n.leida', 'true')
            ->andWhere('n.usuario = :u')->setParameter('u', $usuario)
            ->andWhere('n.leida = false')
            ->getQuery()->execute();
    }
}
