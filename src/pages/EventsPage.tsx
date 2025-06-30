import React, { useEffect, useState } from 'react';
import {
  signIn,
  listEvents as listGcEvents,
  createEvent as createGcEvent,
  updateEvent as updateGcEvent,
  deleteEvent as deleteGcEvent,
} from '../api/googleCalendar';
import {
  listDbEvents,
  createDbEvent,
  updateDbEvent,
  deleteDbEvent,
  DbEvent,
} from '../api/events';
import './ListPages.css';

interface UnifiedEvent {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  endDateTime: string;
  isPublic: boolean;
  source: 'gc' | 'db';
}

interface FormValues {
  title: string;
  description: string;
  dateTime: string;
  endDateTime: string;
  isPublic: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [form, setForm] = useState<FormValues>({
    title: '',
    description: '',
    dateTime: '',
    endDateTime: '',
    isPublic: false,
  });
  const [editing, setEditing] = useState<{ id: string; source: 'db' | 'gc' } | null>(null);
  const isMobile = window.innerWidth <= 600;

  const resetForm = (): void => {
    setForm({ title: '', description: '', dateTime: '', endDateTime: '', isPublic: false });
    setEditing(null);
  };

  const saveLocal = (data: UnifiedEvent[]): void => {
    localStorage.setItem('events', JSON.stringify(data));
  };

  useEffect(() => {
    const fetchAll = async () => {
      if (navigator.onLine) {
        try {
          await signIn();
          const [gc, db] = await Promise.all([listGcEvents(), listDbEvents()]);
          const gcEvents: UnifiedEvent[] = gc.map(ev => ({
            id: ev.id,
            title: ev.summary,
            description: ev.description || '',
            dateTime: ev.start?.dateTime || ev.start?.date || '',
            endDateTime: ev.end?.dateTime || ev.end?.date || '',
            isPublic: ev.visibility === 'public',
            source: 'gc',
          }));
          const dbEvents: UnifiedEvent[] = db.map((ev: DbEvent) => ({
            id: ev.id,
            title: ev.titolo,
            description: ev.descrizione || '',
            dateTime: ev.data_ora,
            endDateTime: ev.data_ora,
            isPublic: !!ev.is_public,
            source: 'db',
          }));
          const all = [...gcEvents, ...dbEvents];
          setEvents(all);
          saveLocal(all);
          return;
        } catch {
          // ignore and try local storage
        }
      }
      const stored = localStorage.getItem('events');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as UnifiedEvent[];
          setEvents(parsed);
        } catch {
          // ignore
        }
      }
    }
    fetchAll();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, description, dateTime, endDateTime, isPublic } = form;
    if (!title || !dateTime) return;

    if (editing) {
      const { id, source } = editing;
      if (navigator.onLine) {
        try {
          if (source === 'gc') {
            await updateGcEvent(id, {
              summary: title,
              description,
              start: { dateTime },
              end: { dateTime: endDateTime || dateTime },
            });
          } else {
            await updateDbEvent(id, {
              titolo: title,
              descrizione: description,
              data_ora: dateTime,
              is_public: isPublic,
            });
          }
        } catch {
          // ignore failures when offline
        }
      }
      const updated = events.map(ev =>
        ev.id === id && ev.source === source
          ? { id, title, description, dateTime, endDateTime, isPublic, source }
          : ev
      )
      setEvents(updated)
      saveLocal(updated)
    } else {
      let gcEvent: UnifiedEvent | null = null
      let dbEvent: UnifiedEvent | null = null
      if (navigator.onLine) {
        try {
          const res = await createGcEvent({
            summary: title,
            description,
            start: { dateTime },
            end: { dateTime: endDateTime || dateTime },
          });
          gcEvent = {
            id: res.id,
            title,
            description,
            dateTime,
            endDateTime: endDateTime || dateTime,
            isPublic,
            source: 'gc',
          }
        } catch {
          // ignore
        }
        try {
          const res = await createDbEvent({
            titolo: title,
            descrizione: description,
            data_ora: dateTime,
            is_public: isPublic,
          });
          dbEvent = {
            id: res.id,
            title: res.titolo,
            description: res.descrizione || '',
            dateTime: res.data_ora,
            endDateTime: res.data_ora,
            isPublic: !!res.is_public,
            source: 'db',
          }
          } catch {
          // ignore
        }
      }
      if (!navigator.onLine || (!gcEvent && !dbEvent)) {
        gcEvent = {
          id: Date.now().toString(),
          title,
          description,
          dateTime,
          endDateTime: endDateTime || dateTime,
          isPublic,
          source: 'gc',
        }
      }
      const newEvents = [...events];
      if (gcEvent) newEvents.push(gcEvent);
      if (dbEvent) newEvents.push(dbEvent);
      setEvents(newEvents);
      saveLocal(newEvents);
    }

    resetForm();
  };

  const onEdit = (ev: UnifiedEvent): void => {
    setEditing({ id: ev.id, source: ev.source });
    setForm({
      title: ev.title,
      description: ev.description,
      dateTime: ev.dateTime,
      endDateTime: ev.endDateTime,
      isPublic: ev.isPublic,
    });
  };

  const onDelete = async (id: string, source: 'gc' | 'db'): Promise<void> => {
    if (navigator.onLine) {
      try {
        if (source === 'gc') await deleteGcEvent(id);
        else await deleteDbEvent(id);
      } catch {
        // ignore
      }
    }
    const updated = events.filter(ev => !(ev.id === id && ev.source === source));
    setEvents(updated);
    saveLocal(updated);
  };

  return (
    <div className="list-page">
        <h2>Eventi</h2>
        <form onSubmit={onSubmit} className="item-form">
        <input
          id="ev-title"
          data-testid="title-input"
          placeholder="Titolo"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          id="ev-description"
          data-testid="description-input"
          placeholder="Descrizione"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          id="ev-date"
          data-testid="date-input"
          type="datetime-local"
          value={form.dateTime}
          onChange={e => setForm({ ...form, dateTime: e.target.value })}
        />
        <input
          id="ev-public"
          type="checkbox"
          checked={form.isPublic}
          onChange={e => setForm({ ...form, isPublic: e.target.checked })}
        />
        <label htmlFor="ev-public">Pubblico</label>
        <button type="submit">{editing ? 'Salva' : 'Aggiungi'}</button>
        {editing && (
          <button type="button" onClick={resetForm}>
            Annulla
          </button>
        )}
      </form>
      <details className="item-dropdown" open={!isMobile}>
        <summary>{isMobile ? 'Lista Eventi Salvati' : 'Eventi salvati'}</summary>
      <table className="item-table">
        <thead>
          <tr>
            <th>Titolo</th>
            <th>Data e ora</th>
            <th>Descrizione</th>
            <th>Pubblico?</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={`${ev.source}-${ev.id}`}>
              <td>{ev.title}</td>
              <td>{new Date(ev.dateTime).toLocaleString()}</td>
              <td>{ev.description}</td>
              <td>{ev.isPublic ? 'Sì' : 'No'}</td>
              <td>
                <button onClick={() => onEdit(ev)}>Modifica</button>
                <button onClick={() => onDelete(ev.id, ev.source)}>Elimina</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </details>
      </div>
  );
}
