import api from './axios'

export interface Segnalazione {
  id: string
  tipo: string
  priorita: string
  data: string
  descrizione: string
  /** Current status, may be omitted if the backend does not return it */
  stato?: string
  lat: number
  lng: number
  /** Optional fields used by some backends */
  latitudine?: number
  longitudine?: number
  data_segnalazione?: string
}

export interface SegnalazioneCreate {
  tipo: string
  priorita: string
  stato: string
  descrizione?: string
  lat?: number
  lng?: number
}

export const listSegnalazioni = (): Promise<Segnalazione[]> =>
  api.get<Segnalazione[]>('/segnalazioni').then(r => r.data)

export const createSegnalazione = (
  data: SegnalazioneCreate
): Promise<Segnalazione> =>
  api.post<Segnalazione>('/segnalazioni', data).then(r => r.data)
