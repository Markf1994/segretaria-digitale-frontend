import api from './axios'

export interface Determination {
  id: string
  capitolo: string
  numero: string
  somma: number
  scadenza: string
  descrizione?: string
}

export const listDeterminations = (): Promise<Determination[]> =>
  api
    .get<Determination[]>('/determinazioni')
    .then(r =>
      r.data.map(d => ({
        ...d,
        descrizione: (d as any).descrizione ?? (d as any).description ?? ''
      }))
    )

export const createDetermination = (
  data: Omit<Determination, 'id'>
): Promise<Determination> =>
  api
    .post<Determination>('/determinazioni', data)
    .then(r => ({
      ...r.data,
      descrizione: (r.data as any).descrizione ?? (r.data as any).description ?? ''
    }))

export const updateDetermination = (
  id: string,
  data: Partial<Omit<Determination, 'id'>>
): Promise<Determination> =>
  api
    .put<Determination>(`/determinazioni/${id}`, data)
    .then(r => ({
      ...r.data,
      descrizione: (r.data as any).descrizione ?? (r.data as any).description ?? ''
    }))

export const deleteDetermination = (id: string): Promise<void> =>
  api.delete(`/determinazioni/${id}`).then(() => undefined)
