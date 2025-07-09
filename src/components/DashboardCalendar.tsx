import React, { useEffect, useMemo, useState } from 'react';
import { signIn, listEvents } from '../api/googleCalendar';
import { listUsers } from '../api/users';
import { useAuthStore } from '../store/auth';
import { DEFAULT_CALENDAR_ID } from '../constants';
import type { GcEvent } from '../api/types';
import { startOfISOWeek, addDays } from 'date-fns';

const DashboardCalendar: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const calendarId =
    import.meta.env.VITE_DASHBOARD_CALENDAR_ID ||
    import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',')[0] ||
    DEFAULT_CALENDAR_ID;

  const [events, setEvents] = useState<GcEvent[]>([]);
  const [userLabels, setUserLabels] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await signIn();
        const [evs, users] = await Promise.all([
          listEvents(calendarId),
          listUsers().then(r => r.data).catch(() => []),
        ]);
        setUserLabels(users.flatMap(u => [u.email, u.nome]));
        setEvents(evs);
      } catch {
        setError('Errore di accesso al calendario');
      }
    };
    fetchData();
  }, [calendarId, refreshFlag]);

  const filtered = useMemo(() => {
    return events.filter(ev => {
      const summary = ev.summary || '';
      if (summary === user?.email) return true;
      if (summary === user?.nome) return true;
      if (!userLabels.includes(summary)) return true;
      return false;
    });
  }, [events, user, userLabels]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, GcEvent[]> = {};
    for (const ev of filtered) {
      const dt = ev.start?.dateTime || ev.start?.date;
      if (!dt) continue;
      const day = dt.split('T')[0];
      if (!map[day]) map[day] = [];
      map[day].push(ev);
    }
    return map;
  }, [filtered]);

  const weekStart = startOfISOWeek(new Date());
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="week-grid">
        {weekDays.map(day => {
          const key = day.toISOString().split('T')[0];
          const dayEvents = eventsByDate[key] || [];
          return (
            <div key={key} className="week-day" data-testid={`day-${key}`}>
              <h3>{day.toLocaleDateString()}</h3>
              <ul>
                {dayEvents.map(ev => (
                  <li key={ev.id}>{ev.summary}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <button onClick={() => setRefreshFlag(f => !f)}>
        Aggiorna calendario
      </button>
    </div>
  );
};

export default DashboardCalendar;
