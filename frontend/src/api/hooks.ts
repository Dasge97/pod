import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type {
  DashboardMe, DashboardDepartment, DashboardSales,
  ProyectoDetalle, Tarea, Bloqueo, Participante, Actividad, Oportunidad, Usuario, Borrador,
} from '../types'

/* ---------- Dashboards ---------- */
export const useDashboardMe = () =>
  useQuery({ queryKey: ['dashboard', 'me'], queryFn: async () => (await api.get<DashboardMe>('/dashboard/me')).data })

export const useDashboardDepartment = () =>
  useQuery({ queryKey: ['dashboard', 'department'], queryFn: async () => (await api.get<DashboardDepartment>('/dashboard/department')).data })

export const useDashboardSales = () =>
  useQuery({ queryKey: ['dashboard', 'sales'], queryFn: async () => (await api.get<DashboardSales>('/dashboard/sales')).data })

/* ---------- Proyecto ---------- */
export const useProyecto = (id: number) =>
  useQuery({ queryKey: ['proyecto', id], queryFn: async () => (await api.get<ProyectoDetalle>(`/projects/${id}`)).data, enabled: !!id })

export const useProyectoTareas = (id: number) =>
  useQuery({ queryKey: ['proyecto', id, 'tareas'], queryFn: async () => (await api.get<Tarea[]>(`/projects/${id}/tasks`)).data, enabled: !!id })

export const useProyectoBloqueos = (id: number) =>
  useQuery({ queryKey: ['proyecto', id, 'bloqueos'], queryFn: async () => (await api.get<Bloqueo[]>(`/projects/${id}/blockers`)).data, enabled: !!id })

export const useProyectoMiembros = (id: number) =>
  useQuery({ queryKey: ['proyecto', id, 'miembros'], queryFn: async () => (await api.get<Participante[]>(`/projects/${id}/members`)).data, enabled: !!id })

export const useProyectoActividad = (id: number) =>
  useQuery({ queryKey: ['proyecto', id, 'actividad'], queryFn: async () => (await api.get<Actividad[]>(`/projects/${id}/activity`)).data, enabled: !!id })

/* ---------- Oportunidad ---------- */
export const useOportunidad = (id: number) =>
  useQuery({ queryKey: ['oportunidad', id], queryFn: async () => (await api.get<Oportunidad>(`/opportunities/${id}`)).data, enabled: !!id })

/* ---------- Usuarios ---------- */
export const useUsuarios = () =>
  useQuery({ queryKey: ['usuarios'], queryFn: async () => (await api.get<Usuario[]>('/users')).data })

/* ---------- Mutaciones ---------- */
function useInvalidar() {
  const qc = useQueryClient()
  return (proyectoId?: number) => {
    qc.invalidateQueries({ queryKey: ['dashboard'] })
    if (proyectoId) qc.invalidateQueries({ queryKey: ['proyecto', proyectoId] })
  }
}

export const useUpdateTarea = () => {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: async ({ id, cambios }: { id: number; cambios: Partial<Tarea> & { asignado?: number | null } }) =>
      (await api.patch<Tarea>(`/tasks/${id}`, cambios)).data,
    onSuccess: (t) => invalidar(t.proyecto?.id),
  })
}

export const useCrearTarea = () => {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: async (cambios: { proyecto: number; titulo: string } & Record<string, unknown>) =>
      (await api.post<Tarea>('/tasks', cambios)).data,
    onSuccess: (t) => invalidar(t.proyecto?.id),
  })
}

export const useCrearBloqueo = () => {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: async (cambios: { proyecto: number; titulo: string } & Record<string, unknown>) =>
      (await api.post<Bloqueo>('/blockers', cambios)).data,
    onSuccess: (b) => invalidar(b.proyecto?.id),
  })
}

export const useResolverBloqueo = () => {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: async ({ id }: { id: number; proyectoId?: number }) =>
      (await api.patch<Bloqueo>(`/blockers/${id}`, { resuelto: true })).data,
    onSuccess: (_b, vars) => invalidar(vars.proyectoId),
  })
}

export const useUpdateProyecto = () => {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: async ({ id, cambios }: { id: number; cambios: Record<string, unknown> }) =>
      (await api.patch<ProyectoDetalle>(`/projects/${id}`, cambios)).data,
    onSuccess: (p) => invalidar(p.id),
  })
}

export const useUpdateOportunidad = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, cambios }: { id: number; cambios: Record<string, unknown> }) =>
      (await api.patch<Oportunidad>(`/opportunities/${id}`, cambios)).data,
    onSuccess: (o) => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'sales'] })
      qc.invalidateQueries({ queryKey: ['oportunidad', o.id] })
    },
  })
}

export const useSeguimiento = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, nota }: { id: number; nota?: string }) =>
      (await api.post<Oportunidad>(`/opportunities/${id}/follow-up`, { nota })).data,
    onSuccess: (o) => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'sales'] })
      qc.invalidateQueries({ queryKey: ['oportunidad', o.id] })
    },
  })
}

/* ---------- IA ---------- */
export const useAnalizarPresupuesto = () =>
  useMutation({
    mutationFn: async (payload: { texto?: string; oportunidadId?: number }) =>
      (await api.post<Borrador>('/ai/analyze', payload)).data,
  })

export const useCrearDesdeBorrador = () => {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      (await api.post<ProyectoDetalle & { tareasCreadas: number }>('/projects/from-draft', payload)).data,
    onSuccess: () => invalidar(),
  })
}
