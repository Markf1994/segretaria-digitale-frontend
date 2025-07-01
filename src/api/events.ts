// src/api/events.ts
import api from './axios'

export interface DbEvent {
  id: string
  titolo: string
  descrizione?: string
  data_ora: string
  is_public?: boolean
  owner_id: string | null
}

export const listDbEvents = (): Promise<DbEvent[]> =>
  api.get<DbEvent[]>('/events').then(r => r.data)

export const createDbEvent = (data: Omit<DbEvent,'id'>): Promise<DbEvent> =>
  api.post<DbEvent>('/events', data).then(r => r.data)

export const updateDbEvent = (
  id: string,
  data: Partial<Omit<DbEvent,'id'>>
): Promise<DbEvent> =>
  api.put<DbEvent>(`/events/${id}`, data).then(r => r.data)

export const deleteDbEvent = (id: string): Promise<void> =>
  api.delete(`/events/${id}`).then(() => undefined)
