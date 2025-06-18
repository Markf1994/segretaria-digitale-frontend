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