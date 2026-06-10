import { useEffect, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage.js'
import caraSheet from '../../assets/cara1-sheet.webp'
import './WelcomeModal.css'

// Frames del ciclo "hablando" en cara1-sheet (tira horizontal de 3 frames).
const FRAMES = 3

// Bienvenida que aparece una vez por sesion: el avatar habla y una burbuja
// pixelart resume donde encontrar cada zona de la sala.
export default function WelcomeModal({ onClose }) {
  const { t } = useLanguage()
  const [frame, setFrame] = useState(0)

  // Cicla los frames para simular que esta hablando.
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES), 220)
    return () => clearInterval(id)
  }, [])

  // Cerrar con Enter o Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="welcome" onMouseDown={onClose}>
      <div className="welcome__inner" onMouseDown={(e) => e.stopPropagation()}>
        <div
          className="welcome__face"
          style={{ backgroundImage: `url(${caraSheet})`, backgroundPositionX: `${frame * 50}%` }}
        />
        <div className="welcome__bubble">
          <p className="welcome__title">{t('welcome.title')}</p>
          <p className="welcome__lead">{t('welcome.lead')}</p>
          <ul className="welcome__list">
            <li><span>{t('welcome.projects')}</span> {t('welcome.projectsWhere')}</li>
            <li><span>{t('welcome.knowledge')}</span> {t('welcome.knowledgeWhere')}</li>
            <li><span>{t('welcome.achievements')}</span> {t('welcome.achievementsWhere')}</li>
            <li><span>{t('welcome.contact')}</span> {t('welcome.contactWhere')}</li>
          </ul>
          <button type="button" className="welcome__btn" onClick={onClose}>{t('welcome.start')}</button>
        </div>
      </div>
    </div>
  )
}
