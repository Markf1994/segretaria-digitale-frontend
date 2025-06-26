import React, { useEffect, useState } from 'react';
import { signIn, listEvents, createEvent } from '../api/googleCalendar';
import './ListPages.css';

interface EventItem { id: string; title: string; date: string; }

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => { setTitle(''); setDate(''); setEditingId(null); };

  const saveLocal = (data: EventItem[]) => {
    localStorage.setItem('events', JSON.stringify(data));
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (navigator.onLine) {
        try {
          await signIn();
          const res = await listEvents();
          const mapped = res.map((ev: any) => ({
            id: ev.id,
            title: ev.summary,
            date: ev.start?.date || ev.start?.dateTime?.slice(0, 10),
          }));
          setEvents(mapped);
          saveLocal(mapped);
          return;
        } catch {
          // fall back to local storage
        }
      }
      const stored = localStorage.getItem('events');
      if (stored) setEvents(JSON.parse(stored));
    };
    fetchEvents();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    if (editingId) {
      const updated = events.map(ev =>
        ev.id === editingId ? { ...ev, title, date } : ev);
      setEvents(updated);
      saveLocal(updated);
    } else {
      if (navigator.onLine) {
        try {
          const res = await createEvent({
            summary: title,
            start: { date },
            end: { date },
          });
          const newItem = { id: res.id, title, date } as EventItem;
          const updated = [...events, newItem];
          setEvents(updated);
          saveLocal(updated);
        } catch {
          const newItem = { id: Date.now().toString(), title, date };
          const updated = [...events, newItem];
          setEvents(updated);
          saveLocal(updated);
        }
      } else {
        const newItem = { id: Date.now().toString(), title, date };
        const updated = [...events, newItem];
        setEvents(updated);
        saveLocal(updated);
      }
    }

    resetForm();
  };

  const onEdit = (item: EventItem) => { setEditingId(item.id); setTitle(item.title); setDate(item.date); };
  const onDelete = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveLocal(updated);
  };

  return (
    <div className="list-page">
      <h2>Eventi</h2>
      <form onSubmit={onSubmit} className="item-form">
        <input placeholder="Titolo" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button type="submit">{editingId ? 'Salva' : 'Aggiungi'}</button>
        {editingId && <button type="button" onClick={resetForm}>Annulla</button>}
      </form>
      <ul className="item-list">
        {events.map(ev => (
          <li key={ev.id}>
            <span>{ev.title} – {new Date(ev.date).toLocaleDateString()}</span>
            <div>
              <button onClick={() => onEdit(ev)}>Modifica</button>
              <button onClick={() => onDelete(ev.id)}>Elimina</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
