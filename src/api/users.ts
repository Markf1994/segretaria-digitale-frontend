import api from './axios'

export interface Utente {
  id: string
  email: string
  nome: string
}

export const listUtenti = () => api.get<Utente[]>('/users/')
