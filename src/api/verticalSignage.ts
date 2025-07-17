import api from './axios'

export interface VerticalSign {
  id: string
  luogo: string
  descrizione: string
  anno?: number
  quantita?: number
}

export const listVerticalSignage = (): Promise<VerticalSign[]> =>
  api.get<VerticalSign[]>('/segnaletica-verticale').then(r => r.data)

export const createVerticalSignage = (
  data: Omit<VerticalSign, 'id'>,
): Promise<VerticalSign> =>
  api.post<VerticalSign>('/segnaletica-verticale', data).then(r => r.data)

export const updateVerticalSignage = (
  id: string,
  data: Partial<Omit<VerticalSign, 'id'>>,
): Promise<VerticalSign> =>
  api.put<VerticalSign>(`/segnaletica-verticale/${id}`, data).then(r => r.data)

export const deleteVerticalSignage = (id: string): Promise<void> =>
  api.delete(`/segnaletica-verticale/${id}`).then(() => undefined)
