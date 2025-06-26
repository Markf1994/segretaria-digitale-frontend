import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useNotificheStore } from "../store/notifiche";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore(s => s.setToken);
  const count = useNotificheStore(s => s.notifications.filter(n => !n.read).length);
  const fetchNotifications = useNotificheStore(s => s.fetch);
  const logout = () => {
    setToken(null);
    navigate("/login");
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <header className="site-header">
      <div className="logo-title">
        <img src="/logo.png" alt="Logo" className="small-logo" />
        <h1>Polizia Locale Castione Presolana</h1>
      </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/events">Eventi</Link>
        <Link to="/todo">To-Do</Link>
        <Link to="/determinazioni">Determine</Link>
        <Link to="/notifiche">Notifiche 🔔{count ? ` (${count})` : ''}</Link>
        <button onClick={logout}>Esci</button>
      </nav>
    </header>
  );
};

export default Header;
