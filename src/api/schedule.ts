import api from './axios'

export interface Turno {
  id: string
  user_id: string
  slot1: string
  slot2?: string | null
  slot3?: string | null
}

export const listTurni = (): Promise<Turno[]> =>
  api.get<Turno[]>('/orari/').then(r => r.data)

export const createTurno = (
  data: Omit<Turno, 'id'>
): Promise<Turno> =>
  api.post<Turno>('/orari/', data).then(r => r.data)

export const deleteTurno = (id: string): Promise<void> =>
  api.delete(`/orari/${id}`).then(() => undefined)
