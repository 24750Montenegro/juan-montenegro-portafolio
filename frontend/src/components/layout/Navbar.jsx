// Barra de navegacion principal del portafolio
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useLanguage } from '../../hooks/useLanguage.js';
import './Navbar.css';

export function Navbar() {
  const { autenticado, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="navbar">
      <div className="navbar__interior">
        <NavLink to="/" className="navbar__marca">Juan Montenegro</NavLink>
        <nav className="navbar__enlaces">
          <NavLink to="/" end>{t('nav.home')}</NavLink>
          <NavLink to="/proyectos">{t('nav.projects')}</NavLink>
          {autenticado ? (
            <>
              <NavLink to="/dashboard">{t('nav.panel')}</NavLink>
              <button type="button" className="navbar__salir" onClick={logout}>{t('nav.logout')}</button>
            </>
          ) : (
            <NavLink to="/login">{t('nav.login')}</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
