interface GapiWindow extends Window {
  gapi: any;
}

const CLIENT_ID = import.meta.env.VITE_GAPI_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GAPI_API_KEY;
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export const signIn = () => {
  return new Promise<void>((resolve, reject) => {
    const gapi = (window as GapiWindow).gapi;
    if (!gapi) {
      reject(new Error('gapi not loaded'));
      return;
    }
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });
        await gapi.auth2.getAuthInstance().signIn();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const listEvents = async () => {
  const gapi = (window as GapiWindow).gapi;
  const res = await gapi.client.calendar.events.list({
    calendarId: 'primary',
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: new Date(0).toISOString(),
  });
  return res.result.items || [];
};

export const createEvent = async (event: {
  summary: string;
  start: { date: string };
  end: { date: string };
}) => {
  const gapi = (window as GapiWindow).gapi;
  const res = await gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
  return res.result;
};
