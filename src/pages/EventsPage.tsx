import React, { useEffect, useState } from 'react';
import './ListPages.css';
import { signIn, listEvents, createEvent, CalendarEvent } from '../api/googleCalendar';

export default function EventsPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const fetchEvents = async () => {
    try {
      const evs = await listEvents();
      setEvents(evs);
    } catch (err) {
      console.error('Failed to load events', err);
    }
  };

  useEffect(() => {
    signIn().then(fetchEvents).catch(console.error);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    await createEvent({
      summary: title,
      start: { date },
      end: { date }
    });
    setTitle('');
    setDate('');
    fetchEvents();
  };

  return (
    <div className="list-page">
      <h2>Eventi</h2>
      <form onSubmit={onSubmit} className="item-form">
        <input placeholder="Titolo" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button type="submit">Aggiungi</button>
      </form>
      <ul className="item-list">
        {events.map(ev => (
          <li key={ev.id}>
            <span>{ev.summary} – {new Date(ev.start.date || ev.start.dateTime).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
