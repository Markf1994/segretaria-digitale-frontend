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
  api
    .get<HorizontalSign[]>('/inventario/signage-horizontal/')
    .then(r => r.data)

export const createHorizontalSignage = (
  data: Omit<HorizontalSign, 'id'>,
): Promise<HorizontalSign> =>
  api
    .post<HorizontalSign>('/inventario/signage-horizontal/', data)
    .then(r => r.data)

export const updateHorizontalSignage = (
  id: string,
  data: Partial<Omit<HorizontalSign, 'id'>>,
): Promise<HorizontalSign> =>
  api
    .put<HorizontalSign>(`/inventario/signage-horizontal/${id}/`, data)
    .then(r => r.data)

export const deleteHorizontalSignage = (id: string): Promise<void> =>
  api
    .delete(`/inventario/signage-horizontal/${id}/`)
    .then(() => undefined)

export const getHorizontalSignagePdf = (year: number): Promise<Blob> =>
  api
    .get('/inventario/signage-horizontal/pdf/', {
      params: { year },
      responseType: 'blob',
    })
    .then(r => r.data)

export const listHorizontalSignageByPlan = (
  planId: string,
): Promise<HorizontalSign[]> =>
  api
    .get<HorizontalSign[]>('/inventario/signage-horizontal/', {
      params: { plan: planId },
    })
    .then(r => r.data)

export const importHorizontalExcel = (file: File): Promise<Blob> => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post('/segnaletica-orizzontale/import', form, { responseType: 'blob' })
    .then(r => r.data)
}
