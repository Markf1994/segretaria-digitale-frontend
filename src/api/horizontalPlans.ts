import api from './axios'

export interface HorizontalPlan {
  id: string
  descrizione: string
  anno: number
}

export const listHorizontalPlans = (): Promise<HorizontalPlan[]> =>
  api.get<HorizontalPlan[]>('/inventario/horizontal-plans').then(r => r.data)

export const createHorizontalPlan = (
  data: Omit<HorizontalPlan, 'id'>,
): Promise<HorizontalPlan> =>
  api.post<HorizontalPlan>('/inventario/horizontal-plans', data).then(r => r.data)

export const updateHorizontalPlan = (
  id: string,
  data: Partial<Omit<HorizontalPlan, 'id'>>,
): Promise<HorizontalPlan> =>
  api
    .put<HorizontalPlan>(`/inventario/horizontal-plans/${id}`, data)
    .then(r => r.data)

export const deleteHorizontalPlan = (id: string): Promise<void> =>
  api.delete(`/inventario/horizontal-plans/${id}`).then(() => undefined)
