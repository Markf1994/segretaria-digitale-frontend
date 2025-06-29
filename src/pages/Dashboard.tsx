import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import './Dashboard.css';
import { differenceInCalendarDays, parseISO } from 'date-fns';
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
  const CALENDAR_ID = 'plcastionedellapresolana@gmail.com';

  const today = new Date();
  const upcomingEvents = events.filter(
    e => differenceInCalendarDays(parseISO(e.dateTime), today) <= 3
  );
  const upcomingTodos = todos.filter(t => differenceInCalendarDays(parseISO(t.due), today) <= 3);

  return (
    <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="upcoming-wrapper">
          <div className="notifications dashboard-section">
            <h2>Todo list 📝</h2>
            <ul>
              {upcomingTodos.map(t => (
                <li key={t.id}>{t.text} – {new Date(t.due).toLocaleDateString()}</li>
              ))}
              {!upcomingTodos.length && <li>Nessun todo imminente.</li>}
            </ul>
          </div>
          <div className="notifications dashboard-section">
            <h2>Eventi in scadenza 📅</h2>
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
               title="calendar"
                src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&mode=WEEK&ctz=Europe/Rome`}
                style={{ border: 0 }}
                width="100%"
                height="600"
                scrolling="no"
             ></iframe>
            <button onClick={() => {
  const el = document.querySelector<HTMLIFrameElement>('iframe[title="calendar"]');
  if (el) el.src = el.src;        // forza reload
}}>
  Aggiorna calendario
</button>
        </div>
      </div>
      </div>
  );
}
