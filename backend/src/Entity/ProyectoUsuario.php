<?php

namespace App\Entity;

use App\Enum\RolProyecto;
use App\Repository\ProyectoUsuarioRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProyectoUsuarioRepository::class)]
#[ORM\Table(name: 'proyecto_usuario')]
#[ORM\UniqueConstraint(name: 'uniq_proyecto_usuario', columns: ['proyecto_id', 'usuario_id'])]
class ProyectoUsuario
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Proyecto::class, inversedBy: 'participantes')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Proyecto $proyecto = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Usuario $usuario = null;

    #[ORM\Column(enumType: RolProyecto::class)]
    private RolProyecto $rol = RolProyecto::Colaborador;

    public function getId(): ?int { return $this->id; }

    public function getProyecto(): ?Proyecto { return $this->proyecto; }
    public function setProyecto(?Proyecto $v): self { $this->proyecto = $v; return $this; }

    public function getUsuario(): ?Usuario { return $this->usuario; }
    public function setUsuario(?Usuario $v): self { $this->usuario = $v; return $this; }

    public function getRol(): RolProyecto { return $this->rol; }
    public function setRol(RolProyecto $v): self { $this->rol = $v; return $this; }
}
