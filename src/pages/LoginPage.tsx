import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";
import Footer from "../components/Footer";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setToken = useAuthStore(s => s.setToken);

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
        <div className="login-card">
          <img src="/logo.png" alt="Logo" className="login-logo" />
          <form className="login-form" onSubmit={onSubmit}>
          <h1>Segretaria Digitale<br/> Polizia Locale Castione della Presolana</h1>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="Email istituzionale"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label htmlFor="login-password">Password</label>
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


