import { useEffect, useState } from 'react'
import caraSheet from '../../assets/cara1-sheet.png'
import './WelcomeModal.css'

// Frames del ciclo "hablando" en cara1-sheet (tira horizontal de 3 frames).
const FRAMES = 3

// Bienvenida que aparece una vez por sesion: el avatar habla y una burbuja
// pixelart resume donde encontrar cada zona de la sala.
export default function WelcomeModal({ onClose }) {
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
          <p className="welcome__title">Bienvenido a mi portafolio</p>
          <p className="welcome__lead">Recorre la sala. Aqui encuentras:</p>
          <ul className="welcome__list">
            <li><span>Proyectos</span> en la computadora</li>
            <li><span>Conocimientos</span> en la estanteria</li>
            <li><span>Logros</span> en la medalla</li>
            <li><span>Contacto y Comentarios</span> en el tablero, junto a la medalla</li>
          </ul>
          <button type="button" className="welcome__btn" onClick={onClose}>EMPEZAR</button>
        </div>
      </div>
    </div>
  )
}
