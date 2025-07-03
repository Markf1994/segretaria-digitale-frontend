import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { decodeToken, getUserId } from '../utils/auth';
import { getUtente } from '../api/users';
import './Greeting.css';

const Greeting: React.FC = () => {
  const token = useAuthStore(s => s.token) || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const decoded = decodeToken(token);
    const initial = decoded?.nome || decoded?.name;
    if (initial) setUsername(initial);
    else {
      const identifier = getUserId(token);
      if (identifier)
        getUtente(identifier)
          .then(r => setUsername(r.data.nome))
          .catch(() => {});
    }
  }, [token]);

  if (!token || !username) return null;
  const hour = new Date().getHours();
  let salutation = 'Buonasera';
  if (hour < 12) salutation = 'Buongiorno';
  else if (hour < 18) salutation = 'Buon pomeriggio';
  return <div className="user-greeting">{salutation} {username}</div>;
};

export default Greeting;
