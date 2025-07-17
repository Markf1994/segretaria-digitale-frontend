import React, { useMemo, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuthStore } from '../store/auth';
import { getUserStorageKey } from '../utils/auth';
import { deleteTodo } from '../api/todos';
import './Dashboard.css';
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from 'date-fns';
import { DEFAULT_CALENDAR_ID, GOOGLE_COLOR_MAP } from '../constants';

interface EventItem {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  isPublic: boolean;
  source?: 'gc' | 'db';
  colorId?: string;
}
interface TodoItem { id: string; text: string; due: string; }

export default function Dashboard() {
  const token = useAuthStore(s => s.token);
  const todoKey = useMemo(
    () => getUserStorageKey('todos', token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)),
    [token]
  );
  const eventsKey = useMemo(
    () =>
      getUserStorageKey(
        'events',
        token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null),
      ),
    [token],
  );
  const [events] = useLocalStorage<EventItem[]>(eventsKey, []);
  const [todos, setTodos] = useLocalStorage<TodoItem[]>(todoKey, []);
  const CALENDAR_ID =
    import.meta.env.VITE_DASHBOARD_CALENDAR_ID ||
    import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',')[0] ||
    DEFAULT_CALENDAR_ID;
  const [refreshCal, setRefreshCal] = useState(false);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const upcomingEvents = events.filter(e => {
    if (e.source !== 'gc') return false;
    const date = parseISO(e.dateTime);
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
  });
  const dashboardTodos = todos;

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
                  <span>
                    <strong>{t.text}</strong> –{' '}
                    {new Date(t.due).toLocaleDateString()}
                  </span>
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
                  <span
                    className="event-color-dot"
                    style={{
                      backgroundColor: e.colorId ? GOOGLE_COLOR_MAP[e.colorId] : 'transparent',
                    }}
                  />
                  Evento: <strong>{e.title}</strong> –{' '}
                  {new Date(e.dateTime).toLocaleDateString()}
                </li>
              ))}
              {!upcomingEvents.length && <li>Nessun evento imminente.</li>}
            </ul>
          </div>
        </div>
        <div className="top-wrapper">
          <div className="calendar-container dashboard-section">
            <iframe
              key={String(refreshCal)}
              src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
                CALENDAR_ID
              )}&mode=MONTH&ctz=Europe/Rome`}
              title="Calendario"
              style={{ border: 0, width: '100%', height: '600px' }}
              frameBorder={0}
              scrolling="no"
            />
            <button onClick={() => setRefreshCal(prev => !prev)}>
              Aggiorna calendario
            </button>
          </div>
        </div>
      </div>
  );
}
