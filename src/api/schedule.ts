import api from './axios'
import { Turno, BackendTurno } from 'src/types/turno'

const fromBackend = (t: BackendTurno): Turno => ({
  id: t.id!,
  user_id: t.user_id,
  giorno: t.giorno,
  slot1: { inizio: t.slot1_inizio, fine: t.slot1_fine },
  slot2:
    t.slot2_inizio && t.slot2_fine
      ? { inizio: t.slot2_inizio, fine: t.slot2_fine }
      : undefined,
  slot3:
    t.slot3_inizio && t.slot3_fine
      ? { inizio: t.slot3_inizio, fine: t.slot3_fine }
      : undefined,
  tipo: t.tipo,
  note: t.note ?? undefined,
})

const toBackend = (t: Turno): BackendTurno => ({
  ...(t.id ? { id: t.id } : {}),
  user_id: t.user_id,
  giorno: t.giorno,
  slot1_inizio: t.slot1.inizio,
  slot1_fine: t.slot1.fine,
  slot2_inizio: t.slot2?.inizio ?? null,
  slot2_fine: t.slot2?.fine ?? null,
  slot3_inizio: t.slot3?.inizio ?? null,
  slot3_fine: t.slot3?.fine ?? null,
  tipo: t.tipo,
  note: t.note ?? null,
})

export const fetchTurni = () =>
  api.get<BackendTurno[]>('/orari/').then(r => r.data.map(fromBackend))

export const saveTurno = (t: Turno) =>
  api.post<BackendTurno>('/orari/', toBackend(t)).then(r => fromBackend(r.data))

export const deleteTurno = (id: string): Promise<void> =>
  api.delete(`/orari/${id}`).then(() => undefined)

export const importTurniExcel = (file: File): Promise<Blob> => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/import/xlsx', form, { responseType: 'blob' }).then(res => res.data)
}
