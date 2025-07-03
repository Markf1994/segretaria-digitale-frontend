import api from './axios'
import { Turno } from '../types/turno'

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
