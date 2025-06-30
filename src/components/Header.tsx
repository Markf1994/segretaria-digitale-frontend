import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import Greeting from "./Greeting";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore(s => s.setToken);
  const logout = () => {
    setToken(null);
    navigate("/login");
  };


  return (
    <header className="site-header">
      <div className="logo-title">
        <img src="/logo.png" alt="Logo" className="small-logo" />
        <h1>Polizia Locale - Castione della Presolana</h1>
      </div>
      <div className="header-right">
        <Greeting />
        <nav>
          <Link to="/">🏠 Dashboard</Link>
          <Link to="/events">📅 Eventi</Link>
          <Link to="/todo">📝 To-Do</Link>
          <Link to="/determinazioni">📄 Determine</Link>
          <Link to="/utilita">⚙️ Utilità</Link>
          <button onClick={logout}>Esci</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
