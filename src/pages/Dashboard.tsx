import React, { useMemo, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuthStore } from '../store/auth';
import { getUserStorageKey } from '../utils/auth';
import { deleteTodo } from '../api/todos';
import './Dashboard.css';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { DEFAULT_CALENDAR_ID } from '../constants';
interface EventItem {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  isPublic: boolean;
}
interface TodoItem { id: string; text: string; due: string; }

export default function Dashboard() {
  const token = useAuthStore(s => s.token);
  const todoKey = useMemo(
    () => getUserStorageKey('todos', token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)),
    [token]
  );
  const [events] = useLocalStorage<EventItem[]>('events', []);
  const [todos, setTodos] = useLocalStorage<TodoItem[]>(todoKey, []);
  const CALENDAR_ID =
    import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',')[0] ||
    DEFAULT_CALENDAR_ID;

  const today = new Date();
  const upcomingEvents = events.filter(
    e => differenceInCalendarDays(parseISO(e.dateTime), today) <= 3
  );
  const dashboardTodos = todos;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const onDelete = async (id: string): Promise<void> => {
    if (navigator.onLine) {
      try {
        await deleteTodo(id);
      } catch {
        // ignore
      }
    }
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
  };

  return (
    <div className="dashboard">
        <div className="upcoming-wrapper">
          <div className="notifications dashboard-section">
            <h2>Todo list 📝</h2>
            <ul>
              {dashboardTodos.map(t => (
                <li key={t.id}>
                  <span>{t.text} – {new Date(t.due).toLocaleDateString()}</span>
                  <button
                    data-testid="dashboard-delete"
                    onClick={() => onDelete(t.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
              {!dashboardTodos.length && <li>Nessun todo.</li>}
            </ul>
          </div>
          <div className="notifications dashboard-section">
            <h2>Impegni dei prossimi giorni 📅</h2>
            <ul>
              {upcomingEvents.map(e => (
                <li key={e.id}>
                  Evento: {e.title} – {new Date(e.dateTime).toLocaleDateString()}
                </li>
              ))}
              {!upcomingEvents.length && <li>Nessun evento imminente.</li>}
            </ul>
          </div>
        </div>
        <div className="top-wrapper">
          <div className="calendar-container dashboard-section">
           <iframe
               ref={iframeRef}
               title="calendar"
                src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&mode=WEEK&ctz=Europe/Rome`}
                style={{ border: 0 }}
                width="100%"
                height="600"
                scrolling="no"
             ></iframe>
            <button onClick={() => {
  if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;        // forza reload
}}>
  Aggiorna calendario
</button>
        </div>
      </div>
      </div>
  );
}
