// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PageTemplate from "./components/PageTemplate";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import EventsPage from "./pages/EventsPage";
import TodoPage from "./pages/TodoPage";
import DeterminationsPage from "./pages/DeterminationsPage";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Login senza header */}
        <Route path="/login" element={<LoginPage />} />

        {/* Tutte le rotte protette ereditano Header + Outlet */}
        <Route
          element={
            <ProtectedRoute>
              <PageTemplate />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/determinazioni" element={<DeterminationsPage />} />
        </Route>

        {/* Qualunque altra rotta redirige alla dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
