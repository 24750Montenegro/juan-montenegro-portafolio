import { useEffect, useState } from 'react'
import caraSheet from '../../assets/cara1-sheet.png'
import './EditorReward.css'

// Frames del ciclo "hablando" en cara1-sheet.
const FRAMES = 3

// Recompensa del easter egg: el avatar aparece sobre el boton del editor con un
// globo pixelart avisando que se habilito la edicion de objetos por esta sesion.
// Se cierra al hacer clic.
export default function EditorReward({ onClose }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES), 220)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="reward" onClick={onClose} title="Cerrar" role="status">
      <div
        className="reward__face"
        style={{ backgroundImage: `url(${caraSheet})`, backgroundPositionX: `${frame * 50}%` }}
      />
      <div className="reward__bubble">
        Has descubierto el easter-egg, como recompensa te habilitare la
        modificacion de objetos existentes{' '}
        <strong>(aunque solo para tu sesion actual)</strong>.
        <span className="reward__hint">clic para cerrar</span>
      </div>
    </div>
  )
}
