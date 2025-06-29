import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";
import Footer from "../components/Footer";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setToken = useAuthStore(s => s.setToken);

  useEffect(() => {
    document.body.classList.add("login-bg");
    return () => {
      document.body.classList.remove("login-bg");
    };
  }, []);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      setToken(res.data.access_token);
      navigate("/");
    } catch {
      alert("Credenziali errate");
    }
  };

  return (
    <>
      <div className="login-page">
        <h1 className="login-title">Segretaria digitale Polizia Locale Castione della Presolana</h1>
        <div className="login-card">
          <img src="/logo.png" alt="Logo" className="login-logo" />
          <form className="login-form" onSubmit={onSubmit}>
          <input
            id="login-email"
            type="email"
            placeholder="Email istituzionale"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
            <button type="submit">Accedi</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;


