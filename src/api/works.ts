import api from './axios'

export interface Work {
  id: string
  descrizione: string
  azienda?: string
}

export const listYears = (): Promise<number[]> =>
  api.get<number[]>('/works/years/').then(r => r.data)

export const listByYear = (year: number): Promise<Work[]> =>
  api.get<Work[]>('/works/', { params: { year } }).then(r => r.data)

export const createWork = (data: Omit<Work, 'id'>): Promise<Work> =>
  api.post<Work>('/works/', data).then(r => r.data)

export const updateWork = (
  id: string,
  data: Partial<Omit<Work, 'id'>>,
): Promise<Work> =>
  api.put<Work>(`/works/${id}/`, data).then(r => r.data)

export const deleteWork = (id: string): Promise<void> =>
  api.delete(`/works/${id}/`).then(() => undefined)

export const getPdf = (year: number): Promise<Blob> =>
  api
    .get('/works/pdf/', { params: { year }, responseType: 'blob' })
    .then(r => r.data)

