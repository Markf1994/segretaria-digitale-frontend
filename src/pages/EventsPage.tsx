import React, { useEffect, useState, useMemo } from 'react';
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
import useIsMobile from '../hooks/useIsMobile';
import { useAuthStore } from '../store/auth';
import { getUserStorageKey, getUserId, decodeToken } from '../utils/auth';
import { DEFAULT_CALENDAR_ID } from '../constants';

interface UnifiedEvent {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  endDateTime: string;
  isPublic: boolean;
  owner_id?: string;
  source: 'gc' | 'db';
  colorId?: string;
}

interface FormValues {
  title: string;
  description: string;
  dateTime: string;
  endDateTime: string;
  isPublic: boolean;
  colorId: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [form, setForm] = useState<FormValues>({
    title: '',
    description: '',
    dateTime: '',
    endDateTime: '',
    isPublic: false,
    colorId: '',
  });
  const [editing, setEditing] = useState<{ id: string; source: 'db' | 'gc' } | null>(null);
  const [calendarError, setCalendarError] = useState('');
  const isMobile = useIsMobile();
  const token = useAuthStore(s => s.token);
  const CALENDAR_ID =
    import.meta.env.VITE_DASHBOARD_CALENDAR_ID ||
    import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',')[0] ||
    DEFAULT_CALENDAR_ID;
  const storageKey = useMemo(
    () =>
      getUserStorageKey(
        'events',
        token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
      ),
    [token]
  );

  const resetForm = (): void => {
    setForm({ title: '', description: '', dateTime: '', endDateTime: '', isPublic: false, colorId: '' });
    setEditing(null);
  };

  const saveLocal = (data: UnifiedEvent[]): void => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  useEffect(() => {
    const fetchAll = async () => {
      const rawToken =
        token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
      const decoded = rawToken ? decodeToken(rawToken) : null;
      const rawCurrentUserId =
        decoded?.sub ?? decoded?.user_id ?? decoded?.id ?? decoded?.email ?? null;
      const currentUserId =
        rawCurrentUserId != null ? String(rawCurrentUserId) : null;
      if (navigator.onLine) {
        try {
          await signIn();
          const [gc, db] = await Promise.all([
            listGcEvents(CALENDAR_ID),
            listDbEvents(),
          ]);
          const gcEvents: UnifiedEvent[] = gc.map(ev => ({
            id: ev.id,
            title: ev.summary,
            description: ev.description || '',
            dateTime: ev.start?.dateTime || ev.start?.date || '',
            endDateTime: ev.end?.dateTime || ev.end?.date || '',
            isPublic: ev.visibility === 'public',
            owner_id: currentUserId || undefined,
            source: 'gc',
            colorId: ev.colorId,
          }));
          const dbEvents: UnifiedEvent[] = db
            .filter(ev =>
              ev.is_public === true ||
              (currentUserId
                ? String(ev.owner_id) === String(currentUserId)
                : false)
            )
            .map((ev: DbEvent) => ({
              id: ev.id,
              title: ev.titolo,
              description: ev.descrizione || '',
              dateTime: ev.data_ora,
              endDateTime: ev.data_ora,
              isPublic: !!ev.is_public,
              owner_id: ev.owner_id || undefined,
              colorId: ev.colorId,
              source: 'db',
            }));
          const all = [...gcEvents, ...dbEvents];
          setEvents(all);
          saveLocal(all);
          return;
        } catch {
          setCalendarError('Errore di accesso al calendario');
        }
      }
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as UnifiedEvent[];
          const filtered = parsed.filter(ev =>
            ev.isPublic ||
            (currentUserId
              ? String(ev.owner_id) === String(currentUserId)
              : false)
          );
          setEvents(filtered);
        } catch {
          // ignore
        }
      }
    }
    fetchAll();
  }, [storageKey]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, description, dateTime, endDateTime, isPublic } = form;
    if (!title || !dateTime) return;

    const userId = getUserId(
      token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
    );

    if (editing) {
      const { id, source } = editing;
      if (navigator.onLine) {
        try {
          if (source === 'gc') {
            await updateGcEvent(CALENDAR_ID, id, {
              summary: title,
              description,
              start: { dateTime },
              end: { dateTime: endDateTime || dateTime },
              visibility: isPublic ? 'public' : 'private',
            });
          } else {
          await updateDbEvent(id, {
            titolo: title,
            descrizione: description,
            data_ora: dateTime,
            is_public: isPublic,
            ...(form.colorId ? { colorId: form.colorId } : {}),
          });
          }
        } catch {
          if (source === 'gc') setCalendarError('Errore di accesso al calendario');
        }
      }
      const updated = events.map(ev =>
        ev.id === id && ev.source === source
          ? { ...ev, title, description, dateTime, endDateTime, isPublic }
          : ev
      )
      setEvents(updated)
      saveLocal(updated)
    } else {
      let gcEvent: UnifiedEvent | null = null
      let dbEvent: UnifiedEvent | null = null
      if (navigator.onLine) {
        try {
          const res = await createGcEvent(CALENDAR_ID, {
            summary: title,
            description,
            start: { dateTime },
            end: { dateTime: endDateTime || dateTime },
            colorId: form.colorId || undefined,
            visibility: isPublic ? 'public' : 'private',
          });
          gcEvent = {
            id: res.id,
            title,
            description,
            dateTime,
            endDateTime: endDateTime || dateTime,
            isPublic,
            owner_id: userId || undefined,
            source: 'gc',
          }
        } catch {
          setCalendarError('Errore di accesso al calendario');
        }
        try {
          const res = await createDbEvent({
            titolo: title,
            descrizione: description,
            data_ora: dateTime,
            is_public: isPublic,
            ...(form.colorId ? { colorId: form.colorId } : {}),
          });
          dbEvent = {
            id: res.id,
            title: res.titolo,
            description: res.descrizione || '',
            dateTime: res.data_ora,
            endDateTime: res.data_ora,
            isPublic: !!res.is_public,
            owner_id: userId || undefined,
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
          owner_id: userId || undefined,
          source: 'gc',
          colorId: form.colorId || undefined,
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
      colorId: '',
    });
  };

  const onDelete = async (id: string, source: 'gc' | 'db'): Promise<void> => {
    if (navigator.onLine) {
      try {
        if (source === 'gc') await deleteGcEvent(CALENDAR_ID, id);
        else await deleteDbEvent(id);
      } catch {
        if (source === 'gc') setCalendarError('Errore di accesso al calendario');
      }
    }
    const updated = events.filter(ev => !(ev.id === id && ev.source === source));
    setEvents(updated);
    saveLocal(updated);
  };

  return (
    <div className="list-page">
        <h2>Eventi</h2>
        {calendarError && <p className="error">{calendarError}</p>}
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
            <th><strong>Titolo</strong></th>
            <th><strong>Data e ora</strong></th>
            <th><strong>Descrizione</strong></th>
            <th><strong>Pubblico?</strong></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events
            .filter(ev => ev.source === 'db')
            .sort((a, b) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
            )
            .map(ev => (
            <tr key={`${ev.source}-${ev.id}`}>
              <td>{ev.title}</td>
              <td className="digit-font">{new Date(ev.dateTime).toLocaleString()}</td>
              <td className="desc-cell">{ev.description}</td>
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
