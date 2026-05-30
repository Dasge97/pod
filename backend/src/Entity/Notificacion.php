<?php

namespace App\Entity;

use App\Repository\NotificacionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificacionRepository::class)]
#[ORM\Table(name: 'notificacion')]
#[ORM\Index(name: 'idx_notif_usuario_leida', columns: ['usuario_id', 'leida'])]
class Notificacion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /** Destinatario de la notificación. */
    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Usuario $usuario = null;

    /** Quién provocó la notificación (autor de la acción). */
    #[ORM\ManyToOne(targetEntity: Usuario::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Usuario $autor = null;

    #[ORM\Column(length: 255)]
    private string $texto = '';

    /** Familia para el icono: tarea|bloqueo|comentario|proyecto|oportunidad|estado. */
    #[ORM\Column(length: 30)]
    private string $tipo = 'estado';

    /** Ruta del frontend a la que enlaza (p. ej. "/proyecto/1"). */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $link = null;

    #[ORM\Column]
    private bool $leida = false;

    #[ORM\Column]
    private \DateTimeImmutable $fecha;

    public function __construct()
    {
        $this->fecha = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getUsuario(): ?Usuario { return $this->usuario; }
    public function setUsuario(?Usuario $v): self { $this->usuario = $v; return $this; }

    public function getAutor(): ?Usuario { return $this->autor; }
    public function setAutor(?Usuario $v): self { $this->autor = $v; return $this; }

    public function getTexto(): string { return $this->texto; }
    public function setTexto(string $v): self { $this->texto = $v; return $this; }

    public function getTipo(): string { return $this->tipo; }
    public function setTipo(string $v): self { $this->tipo = $v; return $this; }

    public function getLink(): ?string { return $this->link; }
    public function setLink(?string $v): self { $this->link = $v; return $this; }

    public function isLeida(): bool { return $this->leida; }
    public function setLeida(bool $v): self { $this->leida = $v; return $this; }

    public function getFecha(): \DateTimeImmutable { return $this->fecha; }
}
