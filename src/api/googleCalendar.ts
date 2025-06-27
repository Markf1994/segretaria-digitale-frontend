// src/api/googleCalendar.ts
import type { GcEvent } from './types'

const CALENDAR_ID = 'primary'

export const signIn = async (): Promise<void> => {
  const gapi = (window as any).gapi
  await gapi.load('client:auth2')
  await gapi.client.init({
    apiKey: import.meta.env.VITE_GAPI_API_KEY,
    clientId: import.meta.env.VITE_GAPI_CLIENT_ID,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    scope: 'https://www.googleapis.com/auth/calendar.events',
  })
  await gapi.auth2.getAuthInstance().signIn()
}

export const listEvents = async (): Promise<GcEvent[]> => {
  const gapi = (window as any).gapi
  const res = await gapi.client.calendar.events.list({
    calendarId: CALENDAR_ID,
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: new Date(0).toISOString(),
  })
  return res.result.items || []
}

export const createEvent = async (event: {
  summary: string
  description?: string
  start: { dateTime: string }
  end: { dateTime: string }
}): Promise<GcEvent> => {
  const gapi = (window as any).gapi
  const res = await gapi.client.calendar.events.insert({
    calendarId: CALENDAR_ID,
    resource: event,
  })
  return res.result
}

// ---- Nuove funzioni ----

export const updateEvent = async (
  id: string,
  event: {
    summary?: string
    description?: string
    start?: { dateTime: string }
    end?: { dateTime: string }
  }
): Promise<GcEvent> => {
  const gapi = (window as any).gapi
  const res = await gapi.client.calendar.events.patch({
    calendarId: CALENDAR_ID,
    eventId: id,
    resource: event,
  })
  return res.result
}

export const deleteEvent = async (id: string): Promise<void> => {
  const gapi = (window as any).gapi
  await gapi.client.calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId: id,
  })
}

