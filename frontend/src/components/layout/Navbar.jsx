// Barra de navegacion principal del portafolio
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import './Navbar.css';

export function Navbar() {
  const { autenticado, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__interior">
        <NavLink to="/" className="navbar__marca">Juan Montenegro</NavLink>
        <nav className="navbar__enlaces">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/proyectos">Proyectos</NavLink>
          {autenticado ? (
            <>
              <NavLink to="/dashboard">Panel</NavLink>
              <button type="button" className="navbar__salir" onClick={logout}>Salir</button>
            </>
          ) : (
            <NavLink to="/login">Acceder</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
