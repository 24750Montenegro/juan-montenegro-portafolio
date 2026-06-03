// Pagina de inicio con una presentacion breve
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage.js';
import './Home.css';

export function Home() {
  const { t } = useLanguage();
  return (
    <section className="inicio">
      <h1 className="inicio__titulo">{t('home.title')}</h1>
      <p className="inicio__subtitulo">{t('home.subtitle')}</p>
      <Link to="/proyectos" className="inicio__cta">{t('home.cta')}</Link>
    </section>
  );
}
