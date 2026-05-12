// Restringe el acceso a rutas que requieren una sesion activa
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function ProtectedRoute({ children }) {
  const { autenticado, cargando } = useAuth();
  if (cargando) return <p className="cargando">Cargando...</p>;
  return autenticado ? children : <Navigate to="/login" replace />;
}
