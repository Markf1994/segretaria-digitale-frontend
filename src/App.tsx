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

import LoginPage from "./pages/LoginPage";
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const EventsPage = React.lazy(() => import("./pages/EventsPage"));
const TodoPage = React.lazy(() => import("./pages/TodoPage"));
const DeterminationsPage = React.lazy(() => import("./pages/DeterminationsPage"));
const UtilitaPage = React.lazy(() => import("./pages/UtilitaPage"));
const SchedulePage = React.lazy(() => import("./pages/SchedulePage"));
const PdfFilesPage = React.lazy(() => import("./pages/PdfFilesPage"));
const InventoryPage = React.lazy(() => import("./pages/InventoryPage"));
const HorizontalSignagePage = React.lazy(() => import("./pages/HorizontalSignagePage"));
const SegnalazioniPage = React.lazy(() => import("./pages/SegnalazioniPage"));
const VerticalTempSignagePage = React.lazy(() => import("./pages/VerticalTempSignagePage"));


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
          <Route path="/pdfs" element={<PdfFilesPage />} />
          <Route path="/orari" element={<SchedulePage />} />
          <Route path="/determinazioni" element={<DeterminationsPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/segnaletica" element={<VerticalTempSignagePage />} />
          <Route path="/segnaletica-orizzontale" element={<HorizontalSignagePage />} />
          <Route path="/segnalazioni" element={<SegnalazioniPage />} />
        </Route>

        {/* Qualunque altra rotta redirige alla dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
