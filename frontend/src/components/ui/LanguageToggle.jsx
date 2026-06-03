// Toggle de idioma flotante (pixelart), fijo arriba a la derecha sobre toda la
// app. Se muestra como un interruptor retro de dos casillas (ES / EN); la casilla
// activa queda resaltada como un keycap. Vive a nivel de App para flotar tambien
// sobre la sala del juego (que es una vista fija a pantalla completa).
import { useLanguage } from '../../hooks/useLanguage.js';
import './LanguageToggle.css';

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="lang-toggle" role="group" aria-label={t('nav.langToggle')}>
      <button
        type="button"
        className={`lang-toggle__opt${lang === 'es' ? ' is-active' : ''}`}
        onClick={() => setLang('es')}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
      <button
        type="button"
        className={`lang-toggle__opt${lang === 'en' ? ' is-active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
}
