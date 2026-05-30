<?php

namespace App\Entity;

use App\Enum\EstadoProyecto;
use App\Enum\Prioridad;
use App\Repository\ProyectoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProyectoRepository::class)]
#[ORM\Table(name: 'proyecto')]
class Proyecto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Oportunidad::class, inversedBy: 'proyectosGenerados')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Oportunidad $oportunidad = null;

    #[ORM\Column(length: 180)]
    private string $nombre = '';

    #[ORM\Column(length: 180)]
    private string $cliente = 'Interno';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $responsable = null;

    #[ORM\Column(enumType: EstadoProyecto::class)]
    private EstadoProyecto $estado = EstadoProyecto::Pendiente;

    #[ORM\Column(enumType: Prioridad::class)]
    private Prioridad $prioridad = Prioridad::Media;

    #[ORM\Column]
    private int $progreso = 0;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $fechaInicio = null;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $fechaFinEstimada = null;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $fechaFinReal = null;

    #[ORM\Column]
    private bool $activo = true;

    #[ORM\Column]
    private \DateTimeImmutable $fechaCreacion;

    /** @var Collection<int, Tarea> */
    #[ORM\OneToMany(mappedBy: 'proyecto', targetEntity: Tarea::class, cascade: ['remove'])]
    private Collection $tareas;

    /** @var Collection<int, ProyectoUsuario> */
    #[ORM\OneToMany(mappedBy: 'proyecto', targetEntity: ProyectoUsuario::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $participantes;

    /** @var Collection<int, Bloqueo> */
    #[ORM\OneToMany(mappedBy: 'proyecto', targetEntity: Bloqueo::class, cascade: ['remove'])]
    private Collection $bloqueos;

    public function __construct()
    {
        $this->fechaCreacion = new \DateTimeImmutable();
        $this->tareas = new ArrayCollection();
        $this->participantes = new ArrayCollection();
        $this->bloqueos = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getOportunidad(): ?Oportunidad { return $this->oportunidad; }
    public function setOportunidad(?Oportunidad $v): self { $this->oportunidad = $v; return $this; }

    public function getNombre(): string { return $this->nombre; }
    public function setNombre(string $v): self { $this->nombre = $v; return $this; }

    public function getCliente(): string { return $this->cliente; }
    public function setCliente(string $v): self { $this->cliente = $v; return $this; }

    public function getDescripcion(): ?string { return $this->descripcion; }
    public function setDescripcion(?string $v): self { $this->descripcion = $v; return $this; }

    public function getResponsable(): ?Usuario { return $this->responsable; }
    public function setResponsable(?Usuario $v): self { $this->responsable = $v; return $this; }

    public function getEstado(): EstadoProyecto { return $this->estado; }
    public function setEstado(EstadoProyecto $v): self { $this->estado = $v; return $this; }

    public function getPrioridad(): Prioridad { return $this->prioridad; }
    public function setPrioridad(Prioridad $v): self { $this->prioridad = $v; return $this; }

    public function getProgreso(): int { return $this->progreso; }
    public function setProgreso(int $v): self { $this->progreso = max(0, min(100, $v)); return $this; }

    public function getFechaInicio(): ?\DateTimeImmutable { return $this->fechaInicio; }
    public function setFechaInicio(?\DateTimeImmutable $v): self { $this->fechaInicio = $v; return $this; }

    public function getFechaFinEstimada(): ?\DateTimeImmutable { return $this->fechaFinEstimada; }
    public function setFechaFinEstimada(?\DateTimeImmutable $v): self { $this->fechaFinEstimada = $v; return $this; }

    public function getFechaFinReal(): ?\DateTimeImmutable { return $this->fechaFinReal; }
    public function setFechaFinReal(?\DateTimeImmutable $v): self { $this->fechaFinReal = $v; return $this; }

    public function isActivo(): bool { return $this->activo; }
    public function setActivo(bool $v): self { $this->activo = $v; return $this; }

    public function getFechaCreacion(): \DateTimeImmutable { return $this->fechaCreacion; }

    /** @return Collection<int, Tarea> */
    public function getTareas(): Collection { return $this->tareas; }

    /** @return Collection<int, ProyectoUsuario> */
    public function getParticipantes(): Collection { return $this->participantes; }

    /** @return Collection<int, Bloqueo> */
    public function getBloqueos(): Collection { return $this->bloqueos; }

    /** ¿Va con retraso? Fin estimado superado y proyecto no finalizado. */
    public function isRetrasado(): bool
    {
        if ($this->estado === EstadoProyecto::Finalizado || $this->fechaFinEstimada === null) {
            return false;
        }
        return $this->fechaFinEstimada < new \DateTimeImmutable('today');
    }
}
