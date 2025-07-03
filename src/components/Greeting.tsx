import React from 'react';
import { useAuthStore } from '../store/auth';
import './Greeting.css';

const Greeting: React.FC = () => {
  const user = useAuthStore(s => s.user);
  if (!user) return null;
  const hour = new Date().getHours();
  let salutation = 'Buonasera';
  if (hour < 12) salutation = 'Buongiorno';
  else if (hour < 18) salutation = 'Buon pomeriggio';
  return <div className="user-greeting">{salutation} {user.nome}</div>;
};

export default Greeting;
