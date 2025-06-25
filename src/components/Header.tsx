import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
        <Link to="/notifiche">Notifiche 🔔</Link>
        <button onClick={logout}>Esci</button>
      </nav>
    </header>
  );
};

export default Header;
