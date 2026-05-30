<?php

namespace App\Enum;

enum RolUsuario: string
{
    case Developer = 'developer';
    case ProjectManager = 'project_manager';
    case Sales = 'sales';
    case DeptManager = 'dept_manager';
    case Admin = 'admin';

    /** Rol Symfony asociado (para el sistema de seguridad). */
    public function symfonyRole(): string
    {
        return match ($this) {
            self::Developer => 'ROLE_DEVELOPER',
            self::ProjectManager => 'ROLE_PROJECT_MANAGER',
            self::Sales => 'ROLE_SALES',
            self::DeptManager => 'ROLE_DEPT_MANAGER',
            self::Admin => 'ROLE_ADMIN',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Developer => 'Desarrollador',
            self::ProjectManager => 'Responsable de proyecto',
            self::Sales => 'Responsable comercial',
            self::DeptManager => 'Responsable de departamento',
            self::Admin => 'Administrador',
        };
    }
}
