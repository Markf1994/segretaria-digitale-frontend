import api from './axios'

export interface VerticalSign {
  id: string
  luogo: string
  descrizione: string
}

export const listVerticalSignage = (): Promise<VerticalSign[]> =>
  api.get<VerticalSign[]>('/inventario/signage-vertical').then(r => r.data)

export const createVerticalSignage = (
  data: Omit<VerticalSign, 'id'>,
): Promise<VerticalSign> =>
  api.post<VerticalSign>('/inventario/signage-vertical', data).then(r => r.data)

export const updateVerticalSignage = (
  id: string,
  data: Partial<Omit<VerticalSign, 'id'>>,
): Promise<VerticalSign> =>
  api.put<VerticalSign>(`/inventario/signage-vertical/${id}`, data).then(r => r.data)

export const deleteVerticalSignage = (id: string): Promise<void> =>
  api.delete(`/inventario/signage-vertical/${id}`).then(() => undefined)
