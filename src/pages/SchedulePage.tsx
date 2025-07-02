import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/auth';
import { getUserStorageKey } from '../utils/auth';
import './ListPages.css';

interface Shift {
  id: string;
  date: string;
  start: string;
  end: string;
  note: string;
}

export default function SchedulePage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');

  const token = useAuthStore(s => s.token);
  const storageKey = useMemo(
    () => getUserStorageKey('shifts', token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)),
    [token]
  );

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setShifts(JSON.parse(stored) as Shift[]);
      } catch {
        /* ignore */
      }
    }
  }, [storageKey]);

  const saveLocal = (data: Shift[]) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const addShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !start || !end) return;
    const newShift: Shift = { id: Date.now().toString(), date, start, end, note };
    const updated = [...shifts, newShift];
    setShifts(updated);
    saveLocal(updated);
    setDate('');
    setStart('');
    setEnd('');
    setNote('');
  };

  const deleteShift = (id: string) => {
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    saveLocal(updated);
  };

  const CALENDAR_ID =
    import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',')[0] ||
    'plcastionedellapresolana@gmail.com';

  return (
    <div className="list-page">
      <h2>Turni</h2>
      <form className="item-form" onSubmit={addShift}>
        <label htmlFor="shift-date">Data</label>
        <input id="shift-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <label htmlFor="shift-start">Inizio</label>
        <input id="shift-start" type="time" value={start} onChange={e => setStart(e.target.value)} />
        <label htmlFor="shift-end">Fine</label>
        <input id="shift-end" type="time" value={end} onChange={e => setEnd(e.target.value)} />
        <input
          id="shift-note"
          placeholder="Note"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button type="submit">Aggiungi</button>
      </form>
      <details className="item-dropdown" open>
        <summary>Turni salvati</summary>
        <table className="item-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Inizio</th>
              <th>Fine</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(s => (
              <tr key={s.id}>
                <td className="digit-font">{new Date(s.date).toLocaleDateString()}</td>
                <td className="digit-font">{s.start}</td>
                <td className="digit-font">{s.end}</td>
                <td className="desc-cell">{s.note}</td>
                <td>
                  <button onClick={() => deleteShift(s.id)}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <div className="calendar-container" style={{ marginTop: '1rem' }}>
        <iframe
          title="calendar"
          src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&mode=WEEK&ctz=Europe/Rome`}
          style={{ border: 0 }}
          width="100%"
          height="600"
          scrolling="no"
        ></iframe>
      </div>
    </div>
  );
}
