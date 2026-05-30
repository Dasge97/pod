<?php

namespace App\Entity;

use App\Enum\EstadoOportunidad;
use App\Repository\OportunidadRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OportunidadRepository::class)]
#[ORM\Table(name: 'oportunidad')]
class Oportunidad
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private string $nombre = '';

    #[ORM\Column(length: 180)]
    private string $cliente = '';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $responsableComercial = null;

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    private string $importe = '0.00';

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $fechaEnvio = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $fechaUltimaAccion = null;

    #[ORM\Column(enumType: EstadoOportunidad::class)]
    private EstadoOportunidad $estado = EstadoOportunidad::Borrador;

    #[ORM\Column]
    private int $probabilidad = 0;

    #[ORM\Column]
    private \DateTimeImmutable $fechaCreacion;

    /** @var Collection<int, Proyecto> */
    #[ORM\OneToMany(mappedBy: 'oportunidad', targetEntity: Proyecto::class)]
    private Collection $proyectosGenerados;

    public function __construct()
    {
        $this->fechaCreacion = new \DateTimeImmutable();
        $this->proyectosGenerados = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getNombre(): string { return $this->nombre; }
    public function setNombre(string $v): self { $this->nombre = $v; return $this; }

    public function getCliente(): string { return $this->cliente; }
    public function setCliente(string $v): self { $this->cliente = $v; return $this; }

    public function getDescripcion(): ?string { return $this->descripcion; }
    public function setDescripcion(?string $v): self { $this->descripcion = $v; return $this; }

    public function getResponsableComercial(): ?Usuario { return $this->responsableComercial; }
    public function setResponsableComercial(?Usuario $v): self { $this->responsableComercial = $v; return $this; }

    public function getImporte(): float { return (float) $this->importe; }
    public function setImporte(float $v): self { $this->importe = number_format($v, 2, '.', ''); return $this; }

    public function getFechaEnvio(): ?\DateTimeImmutable { return $this->fechaEnvio; }
    public function setFechaEnvio(?\DateTimeImmutable $v): self { $this->fechaEnvio = $v; return $this; }

    public function getFechaUltimaAccion(): ?\DateTimeImmutable { return $this->fechaUltimaAccion; }
    public function setFechaUltimaAccion(?\DateTimeImmutable $v): self { $this->fechaUltimaAccion = $v; return $this; }

    public function getEstado(): EstadoOportunidad { return $this->estado; }
    public function setEstado(EstadoOportunidad $v): self { $this->estado = $v; return $this; }

    public function getProbabilidad(): int { return $this->probabilidad; }
    public function setProbabilidad(int $v): self { $this->probabilidad = max(0, min(100, $v)); return $this; }

    public function getFechaCreacion(): \DateTimeImmutable { return $this->fechaCreacion; }

    /** @return Collection<int, Proyecto> */
    public function getProyectosGenerados(): Collection { return $this->proyectosGenerados; }

    /** Días transcurridos desde el envío del presupuesto. */
    public function getDiasDesdeEnvio(): ?int
    {
        if ($this->fechaEnvio === null) {
            return null;
        }
        return (int) $this->fechaEnvio->diff(new \DateTimeImmutable('today'))->days;
    }

    /** Días desde la última acción/seguimiento registrado. */
    public function getDiasSinSeguimiento(): ?int
    {
        if ($this->fechaUltimaAccion === null) {
            return null;
        }
        return (int) $this->fechaUltimaAccion->diff(new \DateTimeImmutable())->days;
    }
}
