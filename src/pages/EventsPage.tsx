import React, { useEffect, useState } from 'react';
import { signIn, listEvents, createEvent } from '../api/googleCalendar';
import './ListPages.css';

interface EventItem {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  isPublic: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDateTime('');
    setIsPublic(false);
    setEditingId(null);
  };

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
            description: ev.description || '',
            dateTime: ev.start?.dateTime || ev.start?.date || '',
            isPublic: ev.visibility === 'public',
          }));
          setEvents(mapped);
          saveLocal(mapped);
          return;
        } catch {
          // fall back to local storage
        }
      }
      const stored = localStorage.getItem('events');
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = parsed.map((ev: any) => ({
          id: ev.id,
          title: ev.title || ev.titolo,
          description: ev.description || ev.descrizione || '',
          dateTime: ev.dateTime || ev.date || ev.data_ora || '',
          isPublic: ev.isPublic ?? ev.is_public ?? false,
        }));
        setEvents(normalized);
      }
    };
    fetchEvents();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateTime) return;

    if (editingId) {
      const updated = events.map(ev =>
        ev.id === editingId
          ? { ...ev, title, description, dateTime, isPublic }
          : ev);
      setEvents(updated);
      saveLocal(updated);
    } else {
      if (navigator.onLine) {
        try {
          const res = await createEvent({
            summary: title,
            description,
            start: { dateTime },
            end: { dateTime },
          });
          const newItem: EventItem = {
            id: res.id,
            title,
            description,
            dateTime,
            isPublic,
          };
          const updated = [...events, newItem];
          setEvents(updated);
          saveLocal(updated);
        } catch {
          const newItem: EventItem = {
            id: Date.now().toString(),
            title,
            description,
            dateTime,
            isPublic,
          };
          const updated = [...events, newItem];
          setEvents(updated);
          saveLocal(updated);
        }
      } else {
        const newItem: EventItem = {
          id: Date.now().toString(),
          title,
          description,
          dateTime,
          isPublic,
        };
        const updated = [...events, newItem];
        setEvents(updated);
        saveLocal(updated);
      }
    }

    resetForm();
  };

  const onEdit = (item: EventItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setDateTime(item.dateTime);
    setIsPublic(item.isPublic);
  };
  const onDelete = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveLocal(updated);
  };

  return (
    <div className="list-page">
      <h2>Eventi</h2>
      <form onSubmit={onSubmit} className="item-form">
        <input
          placeholder="Titolo"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descrizione"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          value={dateTime}
          onChange={e => setDateTime(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
          />
          Pubblico
        </label>
        <button type="submit">{editingId ? 'Salva' : 'Aggiungi'}</button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Annulla
          </button>
        )}
      </form>
      <ul className="item-list">
        {events.map(ev => (
          <li key={ev.id}>
            <span>
              {ev.title} – {new Date(ev.dateTime).toLocaleString()}
              {ev.description && ` – ${ev.description}`}
              {ev.isPublic && ' (Pubblico)'}
            </span>
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
