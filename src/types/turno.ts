export interface Slot {
  inizio: string
  fine: string
}

export interface Turno {
  id: string
  user_id: string
  giorno: string
  slot1: Slot
  slot2?: Slot
  slot3?: Slot
  tipo: 'NORMALE' | 'STRAORD' | 'FERIE' | 'RIPOSO' | 'FESTIVO'
  note?: string
}

export interface BackendTurno {
  id?: string
  user_id: string
  giorno: string
  slot1_inizio: string
  slot1_fine: string
  slot2_inizio?: string | null
  slot2_fine?: string | null
  slot3_inizio?: string | null
  slot3_fine?: string | null
  tipo: 'NORMALE' | 'STRAORD' | 'FERIE' | 'RIPOSO' | 'FESTIVO'
  note?: string | null
}
