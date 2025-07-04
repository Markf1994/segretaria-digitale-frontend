import React from 'react';
import { useAuthStore } from '../store/auth';
import './Greeting.css';

const Greeting: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const hour = new Date().getHours();
  let salutation = 'Buonasera';
  if (hour < 12) salutation = 'Buongiorno';
  else if (hour < 18) salutation = 'Buon pomeriggio';
  const namePart =
    user && user.nome ? (
      <span className="greeting-name"> {user.nome}</span>
    ) : null;
  return <div className="user-greeting">{salutation}{namePart}</div>;
};

export default Greeting;
