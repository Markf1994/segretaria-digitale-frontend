import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth'
import { getUserId } from '../utils/auth'
import { listTurni, createTurno, deleteTurno, Turno } from '../api/schedule'
import './ListPages.css'

export default function SchedulePage() {
  const [slot1, setSlot1] = useState('')
  const [slot2, setSlot2] = useState('')
  const [slot3, setSlot3] = useState('')
  const [turni, setTurni] = useState<Turno[]>([])
  const token = useAuthStore(s => s.token)

  const userId = getUserId(
    token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
  )

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await listTurni()
        setTurni(data)
      } catch {
        // ignore
      }
    }
    fetch()
  }, [])

  const reset = () => {
    setSlot1('')
    setSlot2('')
    setSlot3('')
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slot1) return
    try {
      const res = await createTurno({
        user_id: userId || '',
        slot1,
        slot2: slot2 || null,
        slot3: slot3 || null,
      })
      setTurni([...turni, res])
    } catch {
      // ignore
    }
    reset()
  }

  const onDelete = async (id: string) => {
    try {
      await deleteTurno(id)
    } catch {
      // ignore
    }
    setTurni(turni.filter(t => t.id !== id))
  }

  const CALENDAR_ID =
    import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',')[0] ||
    '9b868ea25bcd2be6f72fc415d45753a30abcc651070802054d21cfa9f5f97559@group.calendar.google.com'

  return (
    <div className="list-page">
      <h2>Turni</h2>
      <form className="item-form" onSubmit={onSubmit}>
        <input
          placeholder="Slot 1"
          value={slot1}
          onChange={e => setSlot1(e.target.value)}
          required
        />
        <input
          placeholder="Slot 2"
          value={slot2}
          onChange={e => setSlot2(e.target.value)}
        />
        <input
          placeholder="Slot 3"
          value={slot3}
          onChange={e => setSlot3(e.target.value)}
        />
        <button type="submit">Aggiungi</button>
      </form>
      <details className="item-dropdown" open>
        <summary>Turni salvati</summary>
        <table className="item-table">
          <thead>
            <tr>
              <th>Slot 1</th>
              <th>Slot 2</th>
              <th>Slot 3</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {turni.map(t => (
              <tr key={t.id}>
                <td className="digit-font">{t.slot1}</td>
                <td className="digit-font">{t.slot2 || ''}</td>
                <td className="digit-font">{t.slot3 || ''}</td>
                <td>
                  <button onClick={() => onDelete(t.id)}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <div className="calendar-container" style={{ marginTop: '1rem' }}>
        <iframe
          title="calendar"
          src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
            CALENDAR_ID
          )}&mode=WEEK&ctz=Europe/Rome`}
          style={{ border: 0 }}
          width="100%"
          height="600"
          scrolling="no"
        ></iframe>
      </div>
    </div>
  )
}
