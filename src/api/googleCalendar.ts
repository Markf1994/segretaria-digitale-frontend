export interface CalendarEvent {
  id?: string;
  summary: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let initPromise: Promise<any> | null = null;

declare const gapi: any;

function initClient() {
  if (!initPromise) {
    initPromise = new Promise((resolve, reject) => {
      if (typeof gapi === 'undefined') {
        reject(new Error('Gapi not loaded'));
        return;
      }
      gapi.load('client:auth2', () => {
        gapi.client
          .init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            discoveryDocs: [DISCOVERY_DOC],
            scope: SCOPES,
          })
          .then(() => resolve(gapi), reject);
      });
    });
  }
  return initPromise;
}

export async function signIn() {
  const g = await initClient();
  await g.auth2.getAuthInstance().signIn();
}

export async function listEvents(): Promise<CalendarEvent[]> {
  const g = await initClient();
  const res = await g.client.calendar.events.list({
    calendarId: 'primary',
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: new Date().toISOString(),
  });
  return res.result.items || [];
}

export async function createEvent(event: CalendarEvent) {
  const g = await initClient();
  const res = await g.client.calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
  return res.result as CalendarEvent;
}
