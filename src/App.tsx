// src/App.tsx
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PageTemplate from "./components/PageTemplate";
import ProtectedRoute from "./components/ProtectedRoute";

import Loader from "./components/Loader";

const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const EventsPage = React.lazy(() => import("./pages/EventsPage"));
const TodoPage = React.lazy(() => import("./pages/TodoPage"));
const DeterminationsPage = React.lazy(() => import("./pages/DeterminationsPage"));
const UtilitaPage = React.lazy(() => import("./pages/UtilitaPage"));


const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
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
          <Route path="/utilita" element={<UtilitaPage />} />
          <Route path="/determinazioni" element={<DeterminationsPage />} />
        </Route>

        {/* Qualunque altra rotta redirige alla dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
