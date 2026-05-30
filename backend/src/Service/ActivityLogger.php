<?php

namespace App\Service;

use App\Entity\Actividad;
use App\Entity\Proyecto;
use App\Entity\Usuario;
use App\Enum\TipoActividad;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Registra actividad operativa automáticamente. Toda acción relevante de negocio
 * debe pasar por aquí para alimentar el feed del departamento.
 */
class ActivityLogger
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    public function log(
        TipoActividad $tipo,
        ?Usuario $usuario,
        string $texto,
        ?string $objeto = null,
        ?Proyecto $proyecto = null,
    ): Actividad {
        $act = new Actividad();
        $act->setTipo($tipo)
            ->setUsuario($usuario)
            ->setTexto($texto)
            ->setObjeto($objeto)
            ->setProyecto($proyecto);

        $this->em->persist($act);

        return $act;
    }
}
