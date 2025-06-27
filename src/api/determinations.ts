import api from './axios'

export interface Determination {
  id: string
  capitolo: string
  numero: string
  somma: number
  scadenza: string
}

export const listDeterminations = (): Promise<Determination[]> =>
  api.get<Determination[]>('/determinazioni').then(r => r.data)

export const createDetermination = (
  data: Omit<Determination, 'id'>
): Promise<Determination> =>
  api.post<Determination>('/determinazioni', data).then(r => r.data)

export const updateDetermination = (
  id: string,
  data: Partial<Omit<Determination, 'id'>>
): Promise<Determination> =>
  api.put<Determination>(`/determinazioni/${id}`, data).then(r => r.data)

export const deleteDetermination = (id: string): Promise<void> =>
  api.delete(`/determinazioni/${id}`).then(() => undefined)
