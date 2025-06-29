import React from 'react';
import { useAuthStore } from '../store/auth';
import { decodeToken } from '../utils/auth';
import './Greeting.css';

const Greeting: React.FC = () => {
  const token = useAuthStore(s => s.token) || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
  if (!token) return null;

  const decoded = decodeToken(token);
  const email: string | undefined = decoded?.email || decoded?.sub || decoded?.user_id || decoded?.id;
  if (!email) return null;

  const username = email.endsWith('@comune.castione.bg.it') ? email.split('@')[0] : email;
  return <div className="user-greeting">Ciao {username}</div>;
};

export default Greeting;
