import React, { useEffect } from 'react';
import { useNotificheStore } from '../store/notifiche';
import './ListPages.css';

const NotificationsPage: React.FC = () => {
  const notifications = useNotificheStore(s => s.notifications);
  const fetch = useNotificheStore(s => s.fetch);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="list-page">
      <h2>Notifiche</h2>
      <ul className="item-list">
        {notifications.map(n => (
          <li key={n.id}>{n.message}</li>
        ))}
        {!notifications.length && <li>Nessuna notifica.</li>}
      </ul>
    </div>
  );
};

export default NotificationsPage;
