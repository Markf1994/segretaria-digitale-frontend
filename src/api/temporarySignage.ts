import api from './axios'

export interface TemporarySign {
  id: string
  luogo: string
  fine_validita: string
  note?: string
}

export const listTemporarySignage = (): Promise<TemporarySign[]> =>
  api.get<TemporarySign[]>('/inventario/signage-temp').then(r => r.data)

export const createTemporarySignage = (
  data: Omit<TemporarySign, 'id'>,
): Promise<TemporarySign> =>
  api.post<TemporarySign>('/inventario/signage-temp', data).then(r => r.data)

export const updateTemporarySignage = (
  id: string,
  data: Partial<Omit<TemporarySign, 'id'>>,
): Promise<TemporarySign> =>
  api.put<TemporarySign>(`/inventario/signage-temp/${id}`, data).then(r => r.data)

export const deleteTemporarySignage = (id: string): Promise<void> =>
  api.delete(`/inventario/signage-temp/${id}`).then(() => undefined)
