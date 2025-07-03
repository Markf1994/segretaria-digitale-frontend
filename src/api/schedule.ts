import api from './axios'

export interface Turno {
  id: string
  user_id: string
  giorno: string
  inizio_1: string
  fine_1: string
  inizio_2?: string | null
  fine_2?: string | null
  inizio_3?: string | null
  fine_3?: string | null
  tipo: 'NORMALE' | 'STRAORD' | 'FERIE' | 'RIPOSO' | 'FESTIVO'
  note?: string | null
}

export const listTurni = (): Promise<Turno[]> =>
  api.get<Turno[]>('/orari/').then(r => r.data)

export const createTurno = (
  data: Omit<Turno, 'id'>
): Promise<Turno> =>
  api.post<Turno>('/orari/', data).then(r => r.data)

export const deleteTurno = (id: string): Promise<void> =>
  api.delete(`/orari/${id}`).then(() => undefined)

export const importTurniExcel = (file: File): Promise<Blob> => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/import/xlsx', form, { responseType: 'blob' }).then(res => res.data)
}
