# Segretaria Digitale Frontend

This project contains the React front end of **Segretaria Digitale**, a simple application for managing events, todos and determinations.

## Setup

1. Ensure [Node.js](https://nodejs.org/) and npm are installed.
2. Install dependencies:

```bash
npm install
```

3. (Optional) Create a `.env` file in the project root to set the backend API endpoint:

```
VITE_API_URL=<url-of-your-api>
```

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

## Backend API

The frontend expects a REST backend exposing at least the following endpoints:

- `POST /login` – authenticate the user and return an `access_token`.
- `GET /determinazioni` – list existing determinations.
- `POST /determinazioni` – create a new determination.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
