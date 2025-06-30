# Segretaria Digitale Frontend

This project contains the React front end of **Segretaria Digitale**, a simple application for managing events, todos and determinations.

## Setup

1. Ensure [Node.js](https://nodejs.org/) and npm are installed.
2. Install dependencies (creates `node_modules/.bin/jest` used by the test suite):

```bash
# Use a clean, reproducible install
npm ci
# or run the helper script
./scripts/setup.sh
```

3. Copy the sample `.env.example` to `.env` and replace the placeholder values:

```
cp .env.example .env
```

Edit `.env` to configure values for `VITE_API_URL`, `VITE_GAPI_CLIENT_ID` and
`VITE_GAPI_API_KEY`. Make sure to supply your own Google credentials for the
`VITE_GAPI_CLIENT_ID` and `VITE_GAPI_API_KEY` variables.

The variables are:

- `VITE_API_URL` – https://segretaria-digitale-backend.onrender.com.
- `VITE_GAPI_CLIENT_ID` – `your-google-client-id`.
- `VITE_GAPI_API_KEY` – `your-google-api-key`.


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

## Utilità page

When the development server is running you can visit `/utilita` for assorted
administrative tools. The page is available at
`http://localhost:3000/utilita` and provides quick links to actions such as PDF
export.

## Testing

Before running tests, install dependencies if you haven't already:

```bash
# Perform a clean install using the lockfile
npm ci
# or run the helper script
./scripts/setup.sh
```

Then run the Jest test suite (dependencies will be installed from the lockfile in offline mode if missing):

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


## Backend Setup

The API used by the frontend resides in a separate backend repository. Clone
the backend and follow its README to install Python dependencies and start the
server. The backend expects a few environment variables to be configured:

- `DATABASE_URL` – connection string for the persistent database.
- `ALGORITHM` – algorithm used for signing JWT access tokens.
- `SECRET_KEY` – secret key for token generation.

Once the environment variables are set you can run `uvicorn main:app` to launch
the API.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
