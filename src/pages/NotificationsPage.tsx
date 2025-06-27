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
      <table className="item-table">
        <thead>
          <tr>
            <th>Messaggio</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id}>
              <td>{n.message}</td>
            </tr>
          ))}
          {!notifications.length && (
            <tr>
              <td>Nessuna notifica.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NotificationsPage;
