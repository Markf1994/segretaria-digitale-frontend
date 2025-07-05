// src/api/googleCalendar.ts
import type { GcEvent } from './types'

const DEFAULT_CALENDAR_ID = 'primary'

export const signIn = async (): Promise<void> => {
  const gapi = (window as any).gapi
  await new Promise<void>((resolve, reject) =>
    gapi.load('client:auth2', { callback: resolve, onerror: reject })
  )
  await gapi.client.init({
    apiKey: import.meta.env.VITE_GAPI_API_KEY,
    clientId: import.meta.env.VITE_GAPI_CLIENT_ID,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    scope: 'https://www.googleapis.com/auth/calendar.events',
  })
  await gapi.auth2.getAuthInstance().signIn()
}

export const listEvents = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
): Promise<GcEvent[]> => {
  const gapi = (window as any).gapi
  const res = await gapi.client.calendar.events.list({
    calendarId,
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: new Date(0).toISOString(),
  })
  return res.result.items || []
}

export const createEvent = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
  event: {
  summary: string
  description?: string
  start: { dateTime: string }
  end: { dateTime: string }
}): Promise<GcEvent> => {
  const gapi = (window as any).gapi
  const res = await gapi.client.calendar.events.insert({
    calendarId,
    resource: event,
  })
  return res.result
}

// ---- Nuove funzioni ----

export const updateEvent = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
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
    calendarId,
    eventId: id,
    resource: event,
  })
  return res.result
}

export const deleteEvent = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
  id: string,
): Promise<void> => {
  const gapi = (window as any).gapi
  await gapi.client.calendar.events.delete({
    calendarId,
    eventId: id,
  })
}

export interface ShiftData {
  userEmail: string
  giorno: string
  slot1: { inizio: string; fine: string }
  slot2?: { inizio: string; fine: string }
  slot3?: { inizio: string; fine: string }
  note?: string
}

export const createShiftEvents = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
  turno: ShiftData
): Promise<void> => {
  const gapi = (window as any).gapi
  const slots = [turno.slot1, turno.slot2, turno.slot3].filter(Boolean) as {
    inizio: string
    fine: string
  }[]

  for (const slot of slots) {
    await gapi.client.calendar.events.insert({
      calendarId,
      resource: {
        summary: turno.userEmail,
        description: turno.note,
        start: { dateTime: `${turno.giorno}T${slot.inizio}` },
        end: { dateTime: `${turno.giorno}T${slot.fine}` },
      },
    })
  }
}

