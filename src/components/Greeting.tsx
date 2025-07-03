import React from 'react';
import { useAuthStore } from '../store/auth';
import { decodeToken } from '../utils/auth';
import './Greeting.css';

const Greeting: React.FC = () => {
  const token = useAuthStore(s => s.token) || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
  if (!token) return null;

  const decoded = decodeToken(token);
  const username: string | undefined = decoded?.nome || decoded?.name;

  if (!username) return null;
  const hour = new Date().getHours();
  let salutation = 'Buonasera';
  if (hour < 12) salutation = 'Buongiorno';
  else if (hour < 18) salutation = 'Buon pomeriggio';
  return <div className="user-greeting">{salutation} {username}</div>;
};

export default Greeting;
