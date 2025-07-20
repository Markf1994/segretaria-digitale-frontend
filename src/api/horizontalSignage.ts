import api from './axios'

export interface HorizontalSign {
  id: string
  luogo: string
  data: string
  descrizione?: string
  quantita?: number
}

export const listHorizontalSignage = (): Promise<HorizontalSign[]> =>
  api
    .get<HorizontalSign[]>('/segnaletica-orizzontale/')
    .then(r => r.data)

export const createHorizontalSignage = (
  data: Omit<HorizontalSign, 'id'>,
): Promise<HorizontalSign> =>
  api
    .post<HorizontalSign>('/segnaletica-orizzontale/', data)
    .then(r => r.data)

export const updateHorizontalSignage = (
  id: string,
  data: Partial<Omit<HorizontalSign, 'id'>>,
): Promise<HorizontalSign> =>
  api
    .put<HorizontalSign>(`/segnaletica-orizzontale/${id}/`, data)
    .then(r => r.data)

export const deleteHorizontalSignage = (id: string): Promise<void> =>
  api
    .delete(`/segnaletica-orizzontale/${id}/`)
    .then(() => undefined)

export const getHorizontalSignagePdf = (year: number): Promise<Blob> =>
  api
    .get('/segnaletica-orizzontale/pdf/', {
      params: { year },
      responseType: 'blob',
    })
    .then(r => r.data)

export const listHorizontalYears = (): Promise<number[]> =>
  api
    .get<number[]>('/segnaletica-orizzontale/years/')
    .then(r => r.data)

export const listHorizontalByYear = (
  year: number,
): Promise<HorizontalSign[]> =>
  api
    .get<HorizontalSign[]>('/segnaletica-orizzontale/', {
      params: { year },
    })
    .then(r => r.data)

export const importHorizontalCsv = (file: File): Promise<Blob> => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post('/segnaletica-orizzontale/import', form, { responseType: 'blob' })
    .then(r => r.data)
}
