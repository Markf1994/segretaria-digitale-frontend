
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import EventsPage from "./pages/EventsPage";
import TodoPage from "./pages/TodoPage";
import DeterminationsPage from "./pages/DeterminationsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Segretaria Digitale</h1>
          <img src="/logo.png" alt="Logo" className="h-12" />
        </header>
        <nav className="bg-blue-600 text-white p-4 flex space-x-4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/events">Eventi</Link>
          <Link to="/todo">ToDo</Link>
          <Link to="/determinations">Determina</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/determinations" element={<DeterminationsPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
