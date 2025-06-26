import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import './ListPages.css';

interface EventItem { id: string; title: string; date: string; }

export default function EventsPage() {
  const [events, setEvents] = useLocalStorage<EventItem[]>('events', []);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => { setTitle(''); setDate(''); setEditingId(null); };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    if (editingId) {
      setEvents(events.map(ev => ev.id === editingId ? { ...ev, title, date } : ev));
    } else {
      setEvents([...events, { id: Date.now().toString(), title, date }]);
    }
    resetForm();
  };

  const onEdit = (item: EventItem) => { setEditingId(item.id); setTitle(item.title); setDate(item.date); };
  const onDelete = (id: string) => setEvents(events.filter(e => e.id !== id));

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
