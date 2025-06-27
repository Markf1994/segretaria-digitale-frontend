// src/api/events.ts
import api from './axios'

// === Tipi ===
export interface DbEvent {
  id: string
  titolo: string
  descrizione?: string
  data_ora: string   // ISO string
  is_public?: boolean
}

// === CRUD ===
export const listDbEvents = (): Promise<DbEvent[]> =>
  api.get<DbEvent[]>('/events').then(res => res.data)

export const createDbEvent = (data: Omit<DbEvent,'id'>): Promise<DbEvent> =>
  api.post<DbEvent>('/events', data).then(res => res.data)

export const updateDbEvent = (id: string, data: Partial<Omit<DbEvent,'id'>>): Promise<DbEvent> =>
  api.put<DbEvent>(`/events/${id}`, data).then(res => res.data)

export const deleteDbEvent = (id: string): Promise<void> =>
  api.delete(`/events/${id}`).then(() => undefined)
