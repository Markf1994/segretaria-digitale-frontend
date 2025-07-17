import api from './axios'

export interface TemporarySign {
  id: string
  luogo: string
  fine_validita: string
  descrizione?: string
  quantita?: number
  note?: string
}

export const listTemporarySignage = (): Promise<TemporarySign[]> =>
  api.get<TemporarySign[]>('/segnaletica-temporanea').then(r => r.data)

export const createTemporarySignage = (
  data: Omit<TemporarySign, 'id'>,
): Promise<TemporarySign> =>
  api.post<TemporarySign>('/segnaletica-temporanea', data).then(r => r.data)

export const updateTemporarySignage = (
  id: string,
  data: Partial<Omit<TemporarySign, 'id'>>,
): Promise<TemporarySign> =>
  api.put<TemporarySign>(`/segnaletica-temporanea/${id}`, data).then(r => r.data)

export const deleteTemporarySignage = (id: string): Promise<void> =>
  api.delete(`/segnaletica-temporanea/${id}`).then(() => undefined)
