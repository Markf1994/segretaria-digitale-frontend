import React, { useMemo } from 'react';
import './ListPages.css';
import MeetingCarousel from '../components/MeetingCarousel';
import useLocalStorage from '../hooks/useLocalStorage';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { getUserStorageKey } from '../utils/auth';
import { useAuthStore } from '../store/auth';

interface EventItem {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  endDateTime: string;
  isPublic: boolean;
}

export default function UtilitaPage() {
  const token = useAuthStore(s => s.token);
  const storageKey = useMemo(
    () =>
      getUserStorageKey(
        'events',
        token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null),
      ),
    [token],
  );
  const [events] = useLocalStorage<EventItem[]>(storageKey, []);

  const today = new Date();
  const keywordRegex = /(Riunione|Call|Meeting|Incontro)/i;
  const upcomingMeetings = events.filter(ev => {
    const diff = differenceInCalendarDays(parseISO(ev.dateTime), today);
    return diff >= 0 && diff <= 3 && keywordRegex.test(ev.title);
  });

  return (
    <div className="utilita-page">
      <MeetingCarousel />
      <div className="meeting-events">
        <h2>Riunioni dei prossimi giorni 📅</h2>
        <ul>
          {upcomingMeetings.map(ev => (
            <li key={ev.id}>
              {ev.title} – {new Date(ev.dateTime).toLocaleDateString()}
            </li>
          ))}
          {!upcomingMeetings.length && <li>Nessuna riunione imminente.</li>}
        </ul>
      </div>
    </div>
  );
}
