<?php

namespace App\Entity;

use App\Enum\RolUsuario;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
#[ORM\Table(name: 'usuario')]
class Usuario implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 120)]
    private string $nombre = '';

    #[ORM\Column(length: 180, unique: true)]
    private string $email = '';

    #[ORM\Column]
    private string $password = '';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    /** Clase de color Tailwind para el avatar (p. ej. "bg-emerald-500"). */
    #[ORM\Column(length: 40)]
    private string $color = 'bg-zinc-500';

    #[ORM\Column(enumType: RolUsuario::class)]
    private RolUsuario $rol = RolUsuario::Developer;

    #[ORM\Column]
    private bool $activo = true;

    #[ORM\Column]
    private \DateTimeImmutable $fechaCreacion;

    public function __construct()
    {
        $this->fechaCreacion = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getNombre(): string { return $this->nombre; }
    public function setNombre(string $v): self { $this->nombre = $v; return $this; }

    public function getEmail(): string { return $this->email; }
    public function setEmail(string $v): self { $this->email = $v; return $this; }

    public function getPassword(): string { return $this->password; }
    public function setPassword(string $v): self { $this->password = $v; return $this; }

    public function getAvatar(): ?string { return $this->avatar; }
    public function setAvatar(?string $v): self { $this->avatar = $v; return $this; }

    public function getColor(): string { return $this->color; }
    public function setColor(string $v): self { $this->color = $v; return $this; }

    public function getRol(): RolUsuario { return $this->rol; }
    public function setRol(RolUsuario $v): self { $this->rol = $v; return $this; }

    public function isActivo(): bool { return $this->activo; }
    public function setActivo(bool $v): self { $this->activo = $v; return $this; }

    public function getFechaCreacion(): \DateTimeImmutable { return $this->fechaCreacion; }

    /** Iniciales para el avatar, derivadas del nombre. */
    public function getIniciales(): string
    {
        $partes = preg_split('/\s+/', trim($this->nombre)) ?: [];
        $ini = '';
        foreach (array_slice($partes, 0, 2) as $p) {
            $ini .= mb_strtoupper(mb_substr($p, 0, 1));
        }
        return $ini ?: '?';
    }

    /* ---- UserInterface ---- */
    public function getRoles(): array
    {
        return array_values(array_unique(['ROLE_USER', $this->rol->symfonyRole()]));
    }

    public function getUserIdentifier(): string { return $this->email; }

    public function eraseCredentials(): void {}
}
