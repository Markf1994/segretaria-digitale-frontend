import api from './axios'

export interface HorizontalSign {
  id: string
  luogo: string
  data: string
  descrizione?: string
  quantita?: number
  piano_id?: string
}

export const listHorizontalSignage = (): Promise<HorizontalSign[]> =>
  api.get<HorizontalSign[]>('/segnaletica-orizzontale').then(r => r.data)

export const createHorizontalSignage = (
  data: Omit<HorizontalSign, 'id'>,
): Promise<HorizontalSign> =>
  api.post<HorizontalSign>('/segnaletica-orizzontale', data).then(r => r.data)

export const updateHorizontalSignage = (
  id: string,
  data: Partial<Omit<HorizontalSign, 'id'>>,
): Promise<HorizontalSign> =>
  api.put<HorizontalSign>(`/segnaletica-orizzontale/${id}`, data).then(r => r.data)

export const deleteHorizontalSignage = (id: string): Promise<void> =>
  api.delete(`/segnaletica-orizzontale/${id}`).then(() => undefined)

export const getHorizontalSignagePdf = (year: number): Promise<Blob> =>
  api
    .get('/segnaletica-orizzontale/pdf', { params: { year }, responseType: 'blob' })
    .then(r => r.data)
