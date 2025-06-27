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

export default function Dashboard() {
  const [events] = useLocalStorage<EventItem[]>('events', []);
  const [todos] = useLocalStorage<TodoItem[]>('todos', []);
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
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="dashboard">
      <div className="calendar-container dashboard-section">
        <iframe
          title="calendar"
          src="https://calendar.google.com/calendar/embed?mode=AGENDA"
          style={{ border: 0 }}
          width="100%"
          height="600"
        ></iframe>
      </div>
      <div className="notifications dashboard-section">
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
      <div className="upcoming-wrapper">
        <div className="notifications dashboard-section">
          <h2>Todo list</h2>
          <ul>
            {upcomingTodos.map(t => (
              <li key={t.id}>To-Do: {t.text} – {new Date(t.due).toLocaleDateString()}</li>
            ))}
            {!upcomingTodos.length && <li>Nessun todo imminente.</li>}
          </ul>
        </div>
        <div className="notifications dashboard-section">
          <h2>Eventi in scadenza</h2>
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
    </div>
  );
}
