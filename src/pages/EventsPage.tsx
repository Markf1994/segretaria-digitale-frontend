import React, { useEffect, useState } from 'react';
import api from '../api/axios';
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
          const res = await api.get<EventItem[]>('/events');
          setEvents(res.data);
          saveLocal(res.data);
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
      if (navigator.onLine) {
        try {
          const res = await api.put<EventItem>(`/events/${editingId}`,
            { title, date });
          const updated = events.map(ev => ev.id === editingId ? res.data : ev);
          setEvents(updated);
          saveLocal(updated);
        } catch {
          const updated = events.map(ev =>
            ev.id === editingId ? { ...ev, title, date } : ev);
          setEvents(updated);
          saveLocal(updated);
        }
      } else {
        const updated = events.map(ev =>
          ev.id === editingId ? { ...ev, title, date } : ev);
        setEvents(updated);
        saveLocal(updated);
      }
    } else {
      if (navigator.onLine) {
        try {
          const res = await api.post<EventItem>('/events', { title, date });
          const updated = [...events, res.data];
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
  const onDelete = async (id: string) => {
    if (navigator.onLine) {
      try {
        await api.delete(`/events/${id}`);
      } catch {
        // ignore and remove locally
      }
    }
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
