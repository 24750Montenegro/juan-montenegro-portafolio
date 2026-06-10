// Aviso para moviles en vertical: el cuarto se ve mejor en horizontal.
// No bloquea: se puede descartar y seguir en vertical con los controles
// tactiles (el bloqueo real de orientacion solo funciona en algunos
// navegadores y se intenta aparte, al cerrar la bienvenida).
import { useLanguage } from '../../hooks/useLanguage.js'
import './RotateHint.css'

export default function RotateHint({ onDismiss }) {
  const { t } = useLanguage()
  return (
    <div className="rotate-hint" role="dialog" aria-label={t('touch.rotate')}>
      <span className="rotate-hint__phone" aria-hidden="true">📱</span>
      <p className="rotate-hint__title">{t('touch.rotate')}</p>
      <p className="rotate-hint__sub">{t('touch.betterLandscape')}</p>
      <button type="button" className="rotate-hint__btn" onClick={onDismiss}>
        {t('touch.continue')}
      </button>
    </div>
  )
}
