import api from './axios'

export interface HorizontalPlan {
  id: string
  descrizione: string
  anno: number
}

export const listHorizontalPlans = (): Promise<HorizontalPlan[]> =>
  api.get<HorizontalPlan[]>('/piani-orizzontali').then(r => r.data)

export const createHorizontalPlan = (
  data: Omit<HorizontalPlan, 'id'>,
): Promise<HorizontalPlan> =>
  api.post<HorizontalPlan>('/piani-orizzontali', data).then(r => r.data)

export const updateHorizontalPlan = (
  id: string,
  data: Partial<Omit<HorizontalPlan, 'id'>>,
): Promise<HorizontalPlan> =>
  api.put<HorizontalPlan>(`/piani-orizzontali/${id}`, data).then(r => r.data)

export const deleteHorizontalPlan = (id: string): Promise<void> =>
  api.delete(`/piani-orizzontali/${id}`).then(() => undefined)

