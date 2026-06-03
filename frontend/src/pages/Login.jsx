// Pagina de inicio de sesion para el administrador del portafolio
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useLanguage } from '../hooks/useLanguage.js';
import { Button } from '../components/ui/Button.jsx';
import './Login.css';

export function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navegar = useNavigate();
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Actualiza el campo del formulario que cambio
  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setCredenciales((previo) => ({ ...previo, [name]: value }));
  };

  // Envia las credenciales y redirige al panel si son validas
  const enviar = async (evento) => {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(credenciales);
      navegar('/dashboard');
    } catch {
      setError(t('login.invalid'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="login">
      <h1 className="login__titulo">{t('login.title')}</h1>
      <form className="login__formulario" onSubmit={enviar}>
        <label className="login__campo">
          <span>{t('login.email')}</span>
          <input
            type="email"
            name="email"
            value={credenciales.email}
            onChange={cambiar}
            required
            autoComplete="email"
          />
        </label>
        <label className="login__campo">
          <span>{t('login.password')}</span>
          <input
            type="password"
            name="password"
            value={credenciales.password}
            onChange={cambiar}
            required
            minLength={8}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="login__error">{error}</p>}
        <Button tipo="submit" disabled={enviando}>
          {enviando ? t('login.entering') : t('login.enter')}
        </Button>
      </form>
    </section>
  );
}
