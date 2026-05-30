import type { Usuario } from '../types'

/** Encargado: responsable de proyecto, de departamento o admin. Gestiona proyectos y asigna a otros. */
export const esEncargado = (u?: Usuario | null) =>
  !!u?.roles?.some((r) => ['ROLE_ADMIN', 'ROLE_DEPT_MANAGER', 'ROLE_PROJECT_MANAGER'].includes(r))

/** Comercial: gestiona oportunidades. */
export const esComercial = (u?: Usuario | null) =>
  !!u?.roles?.some((r) => ['ROLE_ADMIN', 'ROLE_SALES'].includes(r))
