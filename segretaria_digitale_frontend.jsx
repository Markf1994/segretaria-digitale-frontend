// package.json
{
  "name": "segretaria-digitale-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "zustand": "^4.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });

// index.html
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <title>Segretaria Digitale</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

// src/index.css
body {
  font-family: system-ui, sans-serif;
  background: #f4f6f8;
  margin: 0;
  padding: 0;
}
input, select, button {
  font-size: 1rem;
}

// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TodoPage from './pages/TodoPage';
import DeterminazioniPage from './pages/DeterminazioniPage';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
          <Route path="/determinazioni" element={<ProtectedRoute><DeterminazioniPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;

// src/components/Header.tsx
import { useNotificheStore } from '../store/notifiche';
export default function Header() {
  const count = useNotificheStore(s => s.count);
  return (
    <header className="flex items-center justify-between p-4 bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <h1 className="text-lg font-semibold tracking-wide">POLIZIA LOCALE CASTIONE DELLA PRESOLANA</h1>
      <div className="relative">
        🔔
        {count > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-xs text-white rounded-full px-2">{count}</span>}
      </div>
    </header>
  );
}

// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  return token ? <>{children}</> : <Navigate to="/" />;
}

// src/store/auth.ts
import { create } from 'zustand';
interface AuthState { token: string | null; setToken: (token: string | null) => void; }
export const useAuthStore = create<AuthState>(set => ({
  token: localStorage.getItem('token'),
  setToken: (token) => { if (token) localStorage.setItem('token', token); else localStorage.removeItem('token'); set({ token }); }
}));

// src/store/notifiche.ts
import { create } from 'zustand';
interface NotificheState { count: number; setCount: (n: number) => void; }
export const useNotificheStore = create<NotificheState>(set => ({ count: 0, setCount: (n) => set({ count: n }) }));

// src/api/axios.ts
import axios from 'axios';
import { useAuthStore } from '../store/auth';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;

// src/api/login.ts
import api from './axios';
export const login = async (email: string, password: string) => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const res = await api.post('/login', form);
  return res.data.access_token;
};

// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/login';
import { useAuthStore } from '../store/auth';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setToken = useAuthStore(s => s.setToken);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const token = await login(email, password);
      setToken(token);
      navigate('/dashboard');
    } catch {
      setError('Credenziali errate');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input className="border p-2 w-full mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 w-full mb-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleLogin}>Accedi</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
