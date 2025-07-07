import type { Dayjs } from 'dayjs'

export interface Slot {
  inizio: Dayjs
  fine: Dayjs
}

export type TipoTurno =
  | 'NORMALE'
  | 'STRAORD'
  | 'FERIE'
  | 'RIPOSO'
  | 'FESTIVO';

export interface Turno {
  id: string
  user_id: string
  giorno: Dayjs
  slot1: Slot | null
  slot2?: Slot
  slot3?: Slot
  tipo: TipoTurno
  note?: string
  /** Google Calendar event IDs for each slot */
  eventIds?: string[]
}

export interface BackendTurno {
  id?: string
  user_id: string
  giorno: string
  inizio_1: string | null
  fine_1: string | null
  inizio_2?: string | null
  fine_2?: string | null
  inizio_3?: string | null
  fine_3?: string | null
  tipo: TipoTurno
  note?: string | null
}
