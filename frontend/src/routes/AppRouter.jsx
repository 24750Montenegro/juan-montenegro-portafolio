// Definicion de las rutas de la SPA
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home.jsx';
import { Projects } from '../pages/Projects.jsx';
import { Login } from '../pages/Login.jsx';
import { Dashboard } from '../pages/Dashboard.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/proyectos" element={<Projects />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
