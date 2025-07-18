import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import Greeting from "./Greeting";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore(s => s.setToken);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
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
      <div className="header-center">
        <Greeting />
      </div>
      <div className="header-right">
        <nav>
          <Link to="/">🏠 Dashboard</Link>
          <Link to="/events">📅 Impegni</Link>
          <Link to="/todo">📝 To-Do</Link>
          <Link to="/orari">🕑 Orari</Link>
          <Link to="/determinazioni">📄 Determine</Link>
          <Link to="/inventario">📦 Inventario</Link>
          <div className="dropdown" ref={dropRef}>
            <button
              type="button"
              className="dropbtn"
              onClick={() => setDropOpen(o => !o)}
            >
              🚧 Segnaletica
            </button>
            {dropOpen && (
              <div className="dropdown-content">
                <Link to="/segnaletica">Segnaletica verticale/temporanea</Link>
                <Link to="/segnaletica-orizzontale">Segnaletica orizzontale</Link>
              </div>
            )}
          </div>
          <Link to="/segnalazioni">🚨 Segnalazioni</Link>
          <Link to="/utilita">🤝 Riunioni</Link>
          <button onClick={logout} aria-label="Esci">🚪 esci</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
