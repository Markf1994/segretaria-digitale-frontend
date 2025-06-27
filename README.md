# Segretaria Digitale Frontend

This project contains the React front end of **Segretaria Digitale**, a simple application for managing events, todos and determinations.

## Setup

1. Ensure [Node.js](https://nodejs.org/) and npm are installed.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and replace the placeholder values:

```
cp .env.example .env
```

Edit `.env` to configure values for `VITE_API_URL`, `VITE_GAPI_CLIENT_ID`,
`VITE_GAPI_API_KEY`, `VITE_INTEGRATION_TOKEN` and `VITE_OPENAI_KEY`.
The integration token was originally used for a third-party widget. The
`VITE_OPENAI_KEY` variable is required to enable the chat box shown on the
dashboard, which sends prompts to the OpenAI API.

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

The tests use Jest together with React Testing Library.

## Chat Integration

The dashboard displays a small chat box powered by OpenAI. Configure
`VITE_OPENAI_KEY` in your `.env` file with a valid API key to enable it.

## Backend API

The frontend expects a REST backend exposing at least the following endpoints:

- `POST /login` – authenticate the user and return an `access_token`.
- `GET /determinazioni` – list existing determinations.
- `POST /determinazioni` – create a new determination.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
