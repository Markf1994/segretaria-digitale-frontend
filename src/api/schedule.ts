import api from './axios'
import dayjs from 'dayjs'
import { Turno, BackendTurno } from 'src/types/turno'

const fromBackend = (t: BackendTurno): Turno => ({
  id: t.id!,
  user_id: t.user_id,
  giorno: dayjs(t.giorno),
  slot1: { inizio: dayjs(`${t.giorno}T${t.inizio_1}`), fine: dayjs(`${t.giorno}T${t.fine_1}`) },
  slot2:
    t.inizio_2 && t.fine_2
      ? { inizio: dayjs(`${t.giorno}T${t.inizio_2}`), fine: dayjs(`${t.giorno}T${t.fine_2}`) }
      : undefined,
  slot3:
    t.inizio_3 && t.fine_3
      ? { inizio: dayjs(`${t.giorno}T${t.inizio_3}`), fine: dayjs(`${t.giorno}T${t.fine_3}`) }
      : undefined,
  tipo: t.tipo,
  note: t.note ?? undefined,
})

const toBackend = (t: Turno): BackendTurno => ({
  ...(t.id ? { id: t.id } : {}),
  user_id: t.user_id,
  giorno: t.giorno.format('YYYY-MM-DD'),
  inizio_1: t.slot1.inizio.format('HH:mm'),
  fine_1: t.slot1.fine.format('HH:mm'),
  inizio_2: t.slot2 ? t.slot2.inizio.format('HH:mm') : null,
  fine_2: t.slot2 ? t.slot2.fine.format('HH:mm') : null,
  inizio_3: t.slot3 ? t.slot3.inizio.format('HH:mm') : null,
  fine_3: t.slot3 ? t.slot3.fine.format('HH:mm') : null,
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
