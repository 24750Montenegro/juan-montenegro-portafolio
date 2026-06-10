import { useEffect, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage.js'
import caraSheet from '../../assets/cara1-sheet.webp'
import './EditorReward.css'

// Frames del ciclo "hablando" en cara1-sheet.
const FRAMES = 3

// Recompensa del easter egg: el avatar aparece sobre el boton del editor con un
// globo pixelart avisando que se habilito la edicion de objetos por esta sesion.
// Se cierra al hacer clic.
export default function EditorReward({ onClose }) {
  const { t } = useLanguage()
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES), 220)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="reward" onClick={onClose} title={t('editorReward.close')} role="status">
      <div
        className="reward__face"
        style={{ backgroundImage: `url(${caraSheet})`, backgroundPositionX: `${frame * 50}%` }}
      />
      <div className="reward__bubble">
        {t('editorReward.text')}{' '}
        <strong>{t('editorReward.note')}</strong>.
        <span className="reward__hint">{t('editorReward.hint')}</span>
      </div>
    </div>
  )
}
