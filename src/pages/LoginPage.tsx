import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = useAuthStore(s => s.token);
  const setToken = useAuthStore(s => s.setToken);
  const setUser = useAuthStore(s => s.setUser);

  useEffect(() => {
    document.body.classList.add("login-bg");
    return () => {
      document.body.classList.remove("login-bg");
    };
  }, []);

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      setToken(res.data.access_token);
      try {
        const me = await api.get("/users/me");
        setUser(me.data);
      } catch {
        // ignore failure
      }
      navigate("/");
    } catch {
      setError("Credenziali errate");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-page">
      <div className="login-card">
          <img src="/logo.png" alt="Logo" className="login-logo" loading="lazy" />
          {loading ? (
            <Loader />
          ) : (
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
              {error && <p className="error">{error}</p>}
              <button type="submit">Accedi</button>
            </form>
          )}
      </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;


