// src/api/googleCalendar.ts
import type { GcEvent } from './types'

const DEFAULT_CALENDAR_ID = 'primary'
const API_BASE = 'https://www.googleapis.com/calendar/v3'

let accessToken: string | null = null

export const signIn = async (): Promise<void> => {
  const google = (window as any).google
  let tokenClient: any

  google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: () => {},
  })

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/calendar.events',
    callback: (resp: any) => {
      accessToken = resp.access_token
    },
  })

  await new Promise<void>((resolve, reject) => {
    tokenClient.callback = (resp: any) => {
      if (resp.error) reject(resp)
      else {
        accessToken = resp.access_token
        resolve()
      }
    }
    tokenClient.requestAccessToken()
  })
}

export const listEvents = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
): Promise<GcEvent[]> => {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    timeMin: new Date(0).toISOString(),
  })
  const res = await fetch(
    `${API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  const data = await res.json()
  return data.items || []
}

export const createEvent = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
  event: {
  summary: string
  description?: string
  start: { dateTime: string }
  end: { dateTime: string }
}): Promise<GcEvent> => {
  const res = await fetch(
    `${API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  )
  return res.json()
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
  const res = await fetch(
    `${API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  )
  return res.json()
}

export const deleteEvent = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
  id: string,
): Promise<void> => {
  await fetch(
    `${API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
}

export interface ShiftData {
  userEmail: string
  giorno: string
  slot1?: { inizio: string; fine: string }
  slot2?: { inizio: string; fine: string }
  slot3?: { inizio: string; fine: string }
  note?: string
}

export const createShiftEvents = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
  turno: ShiftData
): Promise<string[]> => {
  const slots = [turno.slot1, turno.slot2, turno.slot3].filter(Boolean) as {
    inizio: string
    fine: string
  }[]
  const ids: string[] = []

  for (const slot of slots) {
    const res = await createEvent(calendarId, {
      summary: turno.userEmail,
      description: turno.note,
      start: { dateTime: `${turno.giorno}T${slot.inizio}` },
      end: { dateTime: `${turno.giorno}T${slot.fine}` },
    })
    if (res.id) ids.push(res.id)
  }

  return ids
}

