<?php

namespace App\Entity;

use App\Enum\Prioridad;
use App\Repository\BloqueoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BloqueoRepository::class)]
#[ORM\Table(name: 'bloqueo')]
class Bloqueo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Proyecto::class, inversedBy: 'bloqueos')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Proyecto $proyecto = null;

    #[ORM\ManyToOne(targetEntity: Tarea::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Tarea $tarea = null;

    #[ORM\Column(length: 180)]
    private string $titulo = '';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    /** Severidad del bloqueo (reutiliza la escala de prioridad). */
    #[ORM\Column(enumType: Prioridad::class)]
    private Prioridad $severidad = Prioridad::Alta;

    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $creadoPor = null;

    #[ORM\Column]
    private \DateTimeImmutable $fechaCreacion;

    #[ORM\Column]
    private bool $resuelto = false;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $fechaResolucion = null;

    public function __construct()
    {
        $this->fechaCreacion = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getProyecto(): ?Proyecto { return $this->proyecto; }
    public function setProyecto(?Proyecto $v): self { $this->proyecto = $v; return $this; }

    public function getTarea(): ?Tarea { return $this->tarea; }
    public function setTarea(?Tarea $v): self { $this->tarea = $v; return $this; }

    public function getTitulo(): string { return $this->titulo; }
    public function setTitulo(string $v): self { $this->titulo = $v; return $this; }

    public function getDescripcion(): ?string { return $this->descripcion; }
    public function setDescripcion(?string $v): self { $this->descripcion = $v; return $this; }

    public function getSeveridad(): Prioridad { return $this->severidad; }
    public function setSeveridad(Prioridad $v): self { $this->severidad = $v; return $this; }

    public function getCreadoPor(): ?Usuario { return $this->creadoPor; }
    public function setCreadoPor(?Usuario $v): self { $this->creadoPor = $v; return $this; }

    public function getFechaCreacion(): \DateTimeImmutable { return $this->fechaCreacion; }
    public function setFechaCreacion(\DateTimeImmutable $v): self { $this->fechaCreacion = $v; return $this; }

    public function isResuelto(): bool { return $this->resuelto; }
    public function setResuelto(bool $v): self { $this->resuelto = $v; return $this; }

    public function getFechaResolucion(): ?\DateTimeImmutable { return $this->fechaResolucion; }
    public function setFechaResolucion(?\DateTimeImmutable $v): self { $this->fechaResolucion = $v; return $this; }

    /** Días que lleva abierto el bloqueo. */
    public function getDiasAbierto(): int
    {
        $fin = $this->resuelto && $this->fechaResolucion ? $this->fechaResolucion : new \DateTimeImmutable();
        return (int) $this->fechaCreacion->diff($fin)->days;
    }
}
