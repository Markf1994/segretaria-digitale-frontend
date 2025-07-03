import api from './axios'
import { Turno } from 'src/types/turno'

export const fetchTurni = () => api.get<Turno[]>('/orari/')
export const saveTurno = (t: Turno) => api.post<Turno>('/orari/', t)

export const deleteTurno = (id: string): Promise<void> =>
  api.delete(`/orari/${id}`).then(() => undefined)

export const importTurniExcel = (file: File): Promise<Blob> => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/import/xlsx', form, { responseType: 'blob' }).then(res => res.data)
}
