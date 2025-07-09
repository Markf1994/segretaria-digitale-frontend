import React, { useEffect, useMemo, useState } from 'react';
import { signIn, listEvents } from '../api/googleCalendar';
import { listUsers } from '../api/users';
import { useAuthStore } from '../store/auth';
import { DEFAULT_CALENDAR_ID } from '../constants';
import type { GcEvent } from '../api/types';

interface GroupedEvents {
  date: string;
  events: GcEvent[];
}

const DashboardCalendar: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const calendarId =
    import.meta.env.VITE_DASHBOARD_CALENDAR_ID ||
    import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',')[0] ||
    DEFAULT_CALENDAR_ID;

  const [events, setEvents] = useState<GcEvent[]>([]);
  const [userEmails, setUserEmails] = useState<string[]>([]);
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
        setUserEmails(users.map(u => u.email));
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
      if (!userEmails.includes(summary)) return true;
      return false;
    });
  }, [events, user, userEmails]);

  const grouped: GroupedEvents[] = useMemo(() => {
    const map: Record<string, GcEvent[]> = {};
    for (const ev of filtered) {
      const dt = ev.start?.dateTime || ev.start?.date;
      if (!dt) continue;
      const day = dt.split('T')[0];
      if (!map[day]) map[day] = [];
      map[day].push(ev);
    }
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, events]) => ({ date, events }));
  }, [filtered]);

  if (error) return <div>{error}</div>;

  return (
    <div>
      {grouped.map(g => (
        <div key={g.date}>
          <h3>{new Date(g.date).toLocaleDateString()}</h3>
          <ul>
            {g.events.map(ev => (
              <li key={ev.id}>{ev.summary}</li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={() => setRefreshFlag(f => !f)}>
        Aggiorna calendario
      </button>
    </div>
  );
};

export default DashboardCalendar;
