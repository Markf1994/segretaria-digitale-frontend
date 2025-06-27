import React, { useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import './Dashboard.css';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useNotificheStore } from '../store/notifiche';

interface EventItem {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  isPublic: boolean;
}
interface TodoItem { id: string; text: string; due: string; }
interface Determination {
  id: string;
  capitolo: string;
  numero: string;
  somma: number;
  scadenza: string;
}

export default function Dashboard() {
  const [events] = useLocalStorage<EventItem[]>('events', []);
  const [todos] = useLocalStorage<TodoItem[]>('todos', []);
  const [determinations] = useLocalStorage<Determination[]>('determinations', []);
  const notifications = useNotificheStore(s => s.notifications);
  const fetchNotifications = useNotificheStore(s => s.fetch);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const today = new Date();
  const upcomingEvents = events.filter(
    e => differenceInCalendarDays(parseISO(e.dateTime), today) <= 3
  );
  const upcomingTodos = todos.filter(t => differenceInCalendarDays(parseISO(t.due), today) <= 3);
  const upcomingDeterminations = determinations.filter(
    d => differenceInCalendarDays(parseISO(d.scadenza), today) <= 7
  );
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="dashboard">
      <div className="calendar-container">
        <iframe
          title="calendar"
          src="https://calendar.google.com/calendar/embed?mode=AGENDA"
          style={{ border: 0 }}
          width="100%"
          height="600"
        ></iframe>
      </div>
      <div className="notifications">
        <h2>Ultime notifiche</h2>
        <ul>
          {unreadNotifications.map(n => (
            <li key={n.id}>{n.message}</li>
          ))}
          {!unreadNotifications.length && (
            <li>Nessuna notifica.</li>
          )}
        </ul>
      </div>
      <div className="notifications">
        <h2>Prossime scadenze</h2>
        <ul>
          {upcomingEvents.map(e => (
            <li key={e.id}>
              Evento: {e.title} – {new Date(e.dateTime).toLocaleDateString()}
            </li>
          ))}
          {upcomingTodos.map(t => (
            <li key={t.id}>To-Do: {t.text} – {new Date(t.due).toLocaleDateString()}</li>
          ))}
          {upcomingDeterminations.map(d => (
            <li key={d.id}>
              Determina: {d.capitolo} – {d.numero} –{' '}
              {new Date(d.scadenza).toLocaleDateString()}
            </li>
          ))}
          {!upcomingEvents.length && !upcomingTodos.length && !upcomingDeterminations.length && (
            <li>Nessuna scadenza imminente.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
