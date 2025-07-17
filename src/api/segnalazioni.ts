import api from './axios'

export interface Segnalazione {
  id: string
  tipo: string
  priorita: string
  data: string
  descrizione: string
  lat: number
  lng: number
}

export const listSegnalazioni = (): Promise<Segnalazione[]> =>
  api.get<Segnalazione[]>('/segnalazioni').then(r => r.data)

export const createSegnalazione = (
  data: Omit<Segnalazione, 'id'>
): Promise<Segnalazione> =>
  api.post<Segnalazione>('/segnalazioni', data).then(r => r.data)
