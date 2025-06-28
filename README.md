# Segretaria Digitale Frontend

This project contains the React front end of **Segretaria Digitale**, a simple application for managing events, todos and determinations.

## Setup

1. Ensure [Node.js](https://nodejs.org/) and npm are installed.
2. Install dependencies (creates `node_modules/.bin/jest` used by the test suite):

```bash
npm install
# or run the helper script
./scripts/setup.sh
```

3. Copy `.env.example` to `.env` and replace the placeholder values:

```
cp .env.example .env
```

Edit `.env` to configure values for `VITE_API_URL`, `VITE_GAPI_CLIENT_ID` and
`VITE_GAPI_API_KEY`.

The variables are:

- `VITE_API_URL` – https://segretaria-digitale-backend.onrender.com.
- `VITE_GAPI_CLIENT_ID` – 915439779647-54l80fl9mdsu71j6lsn8n1ggao2p5br6.apps.googleusercontent.com.
- `VITE_GAPI_API_KEY` – AIzaSyAxum50Fxrntu2tewEsDCFOQbE3ortfaMc.

The chat box sends prompts to a backend endpoint instead of directly to OpenAI,
so no OpenAI key is needed in the client.

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

## Testing

Run the Jest test suite:

```bash
npm test
```

If Jest is missing, ensure dependencies are installed first using `npm install`
or `./scripts/setup.sh`.

The tests use Jest together with React Testing Library.

## Chat Integration

The dashboard displays a small chat box powered by OpenAI. Messages are sent to
`/chat` on your backend, which must forward them to OpenAI. Configure the
backend with an `OPENAI_KEY` environment variable containing a valid API key to
enable the feature.

## Backend API

The frontend expects a REST backend exposing at least the following endpoints:

- `POST /login` – authenticate the user and return an `access_token`.
- `GET /determinazioni` – list existing determinations.
- `POST /determinazioni` – create a new determination.
- `POST /chat` – forward chat messages to OpenAI using the `OPENAI_KEY`.


## Backend Setup

The API used by the frontend resides in a separate backend repository. Clone
the backend and follow its README to install Python dependencies and start the
server. The backend expects a few environment variables to be configured:

- `DATABASE_URL` – connection string for the persistent database.
- `ALGORITHM` – algorithm used for signing JWT access tokens.
- `SECRET_KEY` – secret key for token generation.
- `OPENAI_KEY` – API key enabling the `/chat` endpoint.

Once the environment variables are set you can run `uvicorn main:app` to launch
the API.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
