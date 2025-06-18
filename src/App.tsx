import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TodoPage from './pages/TodoPage';
import DeterminazioniPage from './pages/DeterminazioniPage';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
          <Route path="/determinazioni" element={<ProtectedRoute><DeterminazioniPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;