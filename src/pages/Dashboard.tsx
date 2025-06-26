import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import './Dashboard.css';
import { differenceInCalendarDays, parseISO } from 'date-fns';

interface EventItem { id: string; title: string; date: string; }
interface TodoItem { id: string; text: string; due: string; }
interface Determination { id: string; title: string; due: string; }

export default function Dashboard() {
  const [events] = useLocalStorage<EventItem[]>('events', []);
  const [todos] = useLocalStorage<TodoItem[]>('todos', []);
  const [determinations] = useLocalStorage<Determination[]>('determinations', []);

  const today = new Date();
  const upcomingEvents = events.filter(e => differenceInCalendarDays(parseISO(e.date), today) <= 3);
  const upcomingTodos = todos.filter(t => differenceInCalendarDays(parseISO(t.due), today) <= 3);
  const upcomingDeterminations = determinations.filter(d => differenceInCalendarDays(parseISO(d.due), today) <= 7);

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
        <h2>Prossime scadenze</h2>
        <ul>
          {upcomingEvents.map(e => (
            <li key={e.id}>Evento: {e.title} – {new Date(e.date).toLocaleDateString()}</li>
          ))}
          {upcomingTodos.map(t => (
            <li key={t.id}>To-Do: {t.text} – {new Date(t.due).toLocaleDateString()}</li>
          ))}
          {upcomingDeterminations.map(d => (
            <li key={d.id}>Determina: {d.title} – {new Date(d.due).toLocaleDateString()}</li>
          ))}
          {!upcomingEvents.length && !upcomingTodos.length && !upcomingDeterminations.length && (
            <li>Nessuna scadenza imminente.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
