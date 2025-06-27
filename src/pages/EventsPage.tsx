// src/pages/EventsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  signIn,
  listEvents as listGcEvents,
  createEvent as createGcEvent,
  updateEvent as updateGcEvent,
  deleteEvent as deleteGcEvent,
} from '../api/googleCalendar';
import {
  listDbEvents,
  createDbEvent,
  updateDbEvent,
  deleteDbEvent,
  DbEvent,
} from '../api/events';
import './ListPages.css';

type UnifiedEvent =
  | (DbEvent & { source: 'db' })
  | ({
      id: string;
      summary: string;
      description?: string;
      start: { dateTime: string };
      end: { dateTime: string };
    } & { source: 'gc' });

interface FormValues {
  title: string;
  description: string;
  dateTime: string;
  endDateTime: string;
  isPublic: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [form, setForm] = useState<FormValues>({
    title: '',
    description: '',
    dateTime: '',
    endDateTime: '',
    isPublic: false,
  });
  const [editing, setEditing] = useState<{ id: string; source: 'db' | 'gc' } | null>(null);

  // salva su localStorage
  const saveLocal = (data: UnifiedEvent[]) =>
    localStorage.setItem('events', JSON.stringify(data));

  useEffect(() => {
    const fetchAll = async () => {
      // offline fallback
      if (!naviga

