<?php

namespace App\Entity;

use App\Enum\EstadoTarea;
use App\Enum\Prioridad;
use App\Repository\TareaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TareaRepository::class)]
#[ORM\Table(name: 'tarea')]
class Tarea
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Proyecto::class, inversedBy: 'tareas')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Proyecto $proyecto = null;

    #[ORM\Column(length: 180)]
    private string $titulo = '';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Usuario $asignado = null;

    #[ORM\Column(enumType: EstadoTarea::class)]
    private EstadoTarea $estado = EstadoTarea::Pendiente;

    #[ORM\Column(enumType: Prioridad::class)]
    private Prioridad $prioridad = Prioridad::Media;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $estimacionHoras = null;

    #[ORM\Column(type: 'float')]
    private float $horasConsumidas = 0;

    #[ORM\Column]
    private \DateTimeImmutable $fechaCreacion;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $fechaLimite = null;

    public function __construct()
    {
        $this->fechaCreacion = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getProyecto(): ?Proyecto { return $this->proyecto; }
    public function setProyecto(?Proyecto $v): self { $this->proyecto = $v; return $this; }

    public function getTitulo(): string { return $this->titulo; }
    public function setTitulo(string $v): self { $this->titulo = $v; return $this; }

    public function getDescripcion(): ?string { return $this->descripcion; }
    public function setDescripcion(?string $v): self { $this->descripcion = $v; return $this; }

    public function getAsignado(): ?Usuario { return $this->asignado; }
    public function setAsignado(?Usuario $v): self { $this->asignado = $v; return $this; }

    public function getEstado(): EstadoTarea { return $this->estado; }
    public function setEstado(EstadoTarea $v): self { $this->estado = $v; return $this; }

    public function getPrioridad(): Prioridad { return $this->prioridad; }
    public function setPrioridad(Prioridad $v): self { $this->prioridad = $v; return $this; }

    public function getEstimacionHoras(): ?float { return $this->estimacionHoras; }
    public function setEstimacionHoras(?float $v): self { $this->estimacionHoras = $v; return $this; }

    public function getHorasConsumidas(): float { return $this->horasConsumidas; }
    public function setHorasConsumidas(float $v): self { $this->horasConsumidas = $v; return $this; }

    public function getFechaCreacion(): \DateTimeImmutable { return $this->fechaCreacion; }

    public function getFechaLimite(): ?\DateTimeImmutable { return $this->fechaLimite; }
    public function setFechaLimite(?\DateTimeImmutable $v): self { $this->fechaLimite = $v; return $this; }

    /** ¿Vencida? Fecha límite pasada y tarea sin finalizar. */
    public function isVencida(): bool
    {
        if ($this->estado === EstadoTarea::Finalizada || $this->fechaLimite === null) {
            return false;
        }
        return $this->fechaLimite < new \DateTimeImmutable('today');
    }
}
