# Segretaria Digitale Frontend

This project contains the React front end of **Segretaria Digitale**, a simple application for managing events, todos, determinations and orari.

## Setup

1. Ensure [Node.js](https://nodejs.org/) **18** and npm are installed. A `.nvmrc` file
   is provided for use with `nvm`.
2. Install dependencies (creates `node_modules/.bin/jest` used by the test suite):

```bash
npm install
# Dependencies are locked via `package-lock.json`
# If you see 404 errors for `@tanstack/react-query`,
# update the dependency to a recent release (>=4.36.1).
# You can also run the helper script
./scripts/setup.sh
```

3. Copy the sample `.env.example` to `.env` and replace the placeholder values:

```
cp .env.example .env
```

Edit `.env` to configure `VITE_API_URL` and the credentials used by Google
Identity Services (GIS). Set `VITE_GOOGLE_CLIENT_ID` to the OAuth client ID
created in the Google Cloud console. `VITE_GAPI_API_KEY` is optional and only
required for unauthenticated Calendar API calls.

The variables are:

- `VITE_API_URL` – https://<your-backend>.onrender.com.
- `VITE_GOOGLE_CLIENT_ID` – OAuth client ID for GIS.
- `VITE_GAPI_API_KEY` – *(optional)* Google API key used when reading calendars.
- `VITE_SCHEDULE_CALENDAR_IDS` – comma-separated list of Google Calendar IDs used
  by the schedule page. The first ID is selected by default and it falls back to
  `9b868ea25bcd2be6f72fc415d45753a30abcc651070802054d21cfa9f5f97559@group.calendar.google.com`
  when unset.
  The first ID should correspond to a calendar your OAuth client can write to; events
  cannot be created if the client lacks write access.
- `VITE_DASHBOARD_CALENDAR_ID` – calendar ID used by the Dashboard and Events
  pages. If unset, the first ID from `VITE_SCHEDULE_CALENDAR_IDS` is used,
  falling back to the default calendar.
- `VITE_MEET_URL` – Google Meet room URL shown on the Utilità page.
- `VITE_TEAMS_URL` – Microsoft Teams meeting link used by the Utilità page.
- `VITE_ZOOM_URL` – Zoom meeting link used by the Utilità page.

4. Start the development server:

```bash
npm run dev
```


## Troubleshooting Google Calendar sign-in

`Error 400 (Bad Request)` usually means the OAuth client is not configured correctly.
Common fixes include:

- Add local and production domains to **Authorized JavaScript origins**.
- Register redirect URIs only if using the redirect flow.
- Ensure the correct client ID and API key are in `.env`.
- Use HTTPS in production.
- Enable the "Google Calendar API" in the Google Cloud project.

### Migration note

`gapi.auth2` has been removed in favour of Google Identity Services. Rename
`VITE_GAPI_CLIENT_ID` to `VITE_GOOGLE_CLIENT_ID` in your `.env` file and ensure
you have created a GIS OAuth client.

## Development

Run a local development server with hot reload:

```bash
npm run dev
```

The application will be available on `http://localhost:3000`.

## Build

Create an optimized production build:

```bash
npm run build
```

To preview the built site locally:

```bash
npm run serve
```

This serves the `dist` directory using Vite's preview mode.

## Linting

Run ESLint to check for style issues:

```bash
npm run lint
```

Ensure you have installed project dependencies first using `npm install` or
`./scripts/setup.sh`; this installs the TypeScript ESLint plugins required by
the lint step.

Execute this command locally before committing or in your CI pipeline to keep the codebase consistent.

## Utilità page

When the development server is running you can visit `/utilita` for assorted
administrative tools. The page is available at
`http://localhost:3000/utilita` and provides quick links to actions such as PDF
export. The schedule page also includes a **PDF settimana** button that calls
`/orari/pdf?week=YYYY-WW` and opens the generated file.

## Schedule

The schedule page lets you create shifts with up to three optional time slots.
`Slot 1`, `Slot 2` and `Slot 3` can be left empty. When either **Inizio1** or
**Fine1** is blank, that slot is not saved. The same rule applies to the other
slots.

To insert a day off select `RIPOSO`, `FESTIVO` or `RECUPERO` and leave all time fields
blank:

```json
{
  "giorno": "2023-05-01",
  "tipo": "RIPOSO"
}
```

### Excel import

The **Importa Excel** button on the schedule page accepts a spreadsheet with the
following header columns:

```
Giorno | Tipo | Inizio1 | Fine1 | Inizio2 | Fine2 | Inizio3 | Fine3 | Note
```

The `Note` column is optional and can be left blank or filled with text.

Times must be provided in the `HH:mm` format. Cells can be left blank, but any
value entered must be a valid time string or the backend will reject that row.

## Testing

Before running tests, install dependencies if you haven't already:

```bash
npm install
# or run the helper script
./scripts/setup.sh
```

Then run the Jest test suite:

```bash
npm test
```

The tests use Jest together with React Testing Library.


## Backend API

The frontend expects a REST backend exposing at least the following endpoints:

- `POST /login` – authenticate the user and return an `access_token`.
- `GET /determinazioni` – list existing determinations.
- `POST /determinazioni` – create a new determination.

- `GET /pdfs` – list uploaded PDF files.
- `POST /pdfs` – upload a new PDF file.

When Google Calendar synchronization fails the backend should include a warning
message. Endpoints that normally return a PDF can send the message using an
`X-Warning` response header (or include a `warning` field in a JSON payload).
The frontend reads this value and shows it to the user.

Example JSON response:

```json
{
  "url": "/orari/pdf/2023-W18",
  "warning": "Unable to sync with Google Calendar"
}
```


## Backend Setup

The API used by the frontend resides in a separate backend repository. Clone
the backend and follow its README to install Python dependencies and start the
server. The backend expects a few environment variables to be configured:

- `DATABASE_URL` – connection string for the persistent database.
- `ALGORITHM` – algorithm used for signing JWT access tokens.
- `SECRET_KEY` – secret key for token generation.

The backend must send an `Access-Control-Allow-Origin` header allowing the frontend's domain (or `*`) so that features like the Excel import work. You can enable a CORS middleware or configure your framework to add this header.

Once the environment variables are set you can run `uvicorn main:app` to launch
the API.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
