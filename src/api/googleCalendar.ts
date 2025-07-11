// src/api/googleCalendar.ts
import type { GcEvent } from './types'
import type { TipoTurno } from '../types/turno'

const DEFAULT_CALENDAR_ID = 'primary'
const API_BASE = 'https://www.googleapis.com/calendar/v3'

const ACCESS_TOKEN_KEY = 'google_access_token'
const TOKEN_EXPIRES_KEY = 'google_token_expires'

const COLOR_MAP: Record<TipoTurno, string> = {
  NORMALE: '1',
  STRAORD: '2',
  FERIE: '3',
  RIPOSO: '4',
  FESTIVO: '5',
  RECUPERO: '6',
}

const AGENT_COLOR_MAP: Record<string, string> = {
  'Ag.Sc. Fenaroli Marco': '10',
  'Ag.Sc. Danesi Mattia': '6',
  'Sovr. Licini Rossella': '1',
}

export const formatDateTime = (local: string): string => {
  const d = new Date(local)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const off = -d.getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const offH = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0')
  const offM = String(Math.abs(off) % 60).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}:${s}${sign}${offH}:${offM}`
}

const getStoredToken = (): string | null => {
  if (typeof localStorage === 'undefined') return null
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const expires = localStorage.getItem(TOKEN_EXPIRES_KEY)
  if (token && expires && Date.now() < Number(expires)) return token
  return null
}

const storeToken = (token: string, expiresIn: number = 3600): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    localStorage.setItem(
      TOKEN_EXPIRES_KEY,
      String(Date.now() + expiresIn * 1000),
    )
  }
}

let accessToken: string | null = getStoredToken()

export const signIn = async (): Promise<void> => {
  const existing = getStoredToken()
  if (existing) {
    accessToken = existing
    return
  }
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
      storeToken(accessToken, resp.expires_in)
    },
  })

  await new Promise<void>((resolve, reject) => {
    tokenClient.callback = (resp: any) => {
      if (resp.error) reject(resp)
      else {
        accessToken = resp.access_token
        storeToken(accessToken, resp.expires_in)
        resolve()
      }
    }
    tokenClient.requestAccessToken()
  })
}

export const listEvents = async (
  calendarId: string = DEFAULT_CALENDAR_ID,
  timeMin?: Date,
  timeMax?: Date,
): Promise<GcEvent[]> => {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
  })
  if (timeMin) params.set('timeMin', timeMin.toISOString())
  if (timeMax) params.set('timeMax', timeMax.toISOString())
  const res = await fetch(
    `${API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken || getStoredToken()}`,
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
  colorId?: string
}): Promise<GcEvent> => {
  const res = await fetch(
    `${API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken || getStoredToken()}`,
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
        Authorization: `Bearer ${accessToken || getStoredToken()}`,
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
        Authorization: `Bearer ${accessToken || getStoredToken()}`,
      },
    },
  )
}

export interface ShiftData {
  nome: string
  giorno: string
  slot1?: { inizio: string; fine: string }
  slot2?: { inizio: string; fine: string }
  slot3?: { inizio: string; fine: string }
  note?: string
  tipo?: TipoTurno
  colorId?: string
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
  const colorId =
    turno.colorId ??
    AGENT_COLOR_MAP[turno.nome] ??
    (turno.tipo ? COLOR_MAP[turno.tipo] : undefined)

  for (const slot of slots) {
    const res = await createEvent(calendarId, {
      summary: `turno ${turno.nome}`,
      description: turno.note,
      start: {
        dateTime: formatDateTime(`${turno.giorno}T${slot.inizio}:00`),
      },
      end: {
        dateTime: formatDateTime(`${turno.giorno}T${slot.fine}:00`),
      },
      ...(colorId ? { colorId } : {}),
    })
    if (res.id) ids.push(res.id)
  }

  return ids
}

