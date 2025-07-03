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
