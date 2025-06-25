import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Dashboard.css';
import api from '../api/axios';
import { parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string; // ISO string
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Event[]>('/events/');
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Calcola inizio e fine della settimana (lun–dom)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(selectedDate,   { weekStartsOn: 1 });

  // Filtra gli eventi nella settimana selezionata
  const weeklyEvents = events.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  // Evidenzia i giorni che hanno almeno un evento
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      return events.some(e =>
        parseISO(e.date).toDateString() === date.toDateString()
      )
        ? 'highlight-day'
        : null;
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <aside className="calendar-sidebar">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={tileClassName}
        />
      </aside>
      <section className="events-list">
        <h2>Eventi di questa settimana</h2>
        {weeklyEvents.length ? (
          <ul>
            {weeklyEvents.map(e => (
              <li key={e.id}>
                <strong>{e.title}</strong> —{' '}
                {new Date(e.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nessun evento in programma questa settimana.</p>
        )}
      </section>
    </div>
  );
}


