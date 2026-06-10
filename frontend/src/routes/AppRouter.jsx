// Definicion de las rutas de la SPA. Las paginas secundarias se cargan bajo
// demanda (code-splitting) para que la sala inicial pese menos.
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Room from '../pages/Room.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

const Projects = lazy(() => import('../pages/Projects.jsx').then((m) => ({ default: m.Projects })));
const Login = lazy(() => import('../pages/Login.jsx').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx').then((m) => ({ default: m.Dashboard })));

export function AppRouter() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Room />} />
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
    </Suspense>
  );
}
