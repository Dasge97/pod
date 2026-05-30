<?php

namespace App\Entity;

use App\Enum\TipoActividad;
use App\Repository\ActividadRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ActividadRepository::class)]
#[ORM\Table(name: 'actividad')]
#[ORM\Index(name: 'idx_actividad_fecha', columns: ['fecha'])]
class Actividad
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Usuario $usuario = null;

    #[ORM\ManyToOne(targetEntity: Proyecto::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Proyecto $proyecto = null;

    #[ORM\Column(enumType: TipoActividad::class)]
    private TipoActividad $tipo = TipoActividad::Comentario;

    /** Texto de la acción ("completó la tarea"). */
    #[ORM\Column(length: 255)]
    private string $texto = '';

    /** Objeto sobre el que se actúa ("Diseño de la API"). */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $objeto = null;

    #[ORM\Column]
    private \DateTimeImmutable $fecha;

    public function __construct()
    {
        $this->fecha = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getUsuario(): ?Usuario { return $this->usuario; }
    public function setUsuario(?Usuario $v): self { $this->usuario = $v; return $this; }

    public function getProyecto(): ?Proyecto { return $this->proyecto; }
    public function setProyecto(?Proyecto $v): self { $this->proyecto = $v; return $this; }

    public function getTipo(): TipoActividad { return $this->tipo; }
    public function setTipo(TipoActividad $v): self { $this->tipo = $v; return $this; }

    public function getTexto(): string { return $this->texto; }
    public function setTexto(string $v): self { $this->texto = $v; return $this; }

    public function getObjeto(): ?string { return $this->objeto; }
    public function setObjeto(?string $v): self { $this->objeto = $v; return $this; }

    public function getFecha(): \DateTimeImmutable { return $this->fecha; }
    public function setFecha(\DateTimeImmutable $v): self { $this->fecha = $v; return $this; }
}
