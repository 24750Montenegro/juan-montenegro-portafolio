import { useEffect, useRef, useState } from 'react'
import {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  WALL_INT,
  isBehindWall,
  toClipPath,
} from '../game/geometry'
import { useMovement } from '../game/useMovement'
import { INTERACTABLES, nearestInteractable } from '../game/interactables'
import Character from '../components/game/Character'
import ScreenModal from '../components/game/ScreenModal'
import ProjectsScreen from '../components/game/ProjectsScreen'
import BreakoutGame from '../components/game/BreakoutGame'
import roomImg from '../assets/habitación vacia.png'
import './Room.css'

// Punto inicial de los pies, dentro del piso
const START = [1300, 1000]

const wallClip = toClipPath(WALL_INT)

export default function Room() {
  // 'monitor' | 'tv' | null. Con un modal abierto se pausa el movimiento.
  const [activeModal, setActiveModal] = useState(null)
  const { pos, facing, moving } = useMovement(START, activeModal !== null)
  const [scale, setScale] = useState(1)
  const viewportRef = useRef(null)

  // Escala la escena para encajar en el viewport conservando proporcion
  useEffect(() => {
    const fit = () => {
      const el = viewportRef.current
      if (!el) return
      const s = Math.min(el.clientWidth / ROOM_WIDTH, el.clientHeight / ROOM_HEIGHT)
      setScale(s)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const [x, y] = pos
  // Detras de la pared interna: el personaje pasa por debajo de ella
  const behindWall = isBehindWall(x, y)

  // Objeto interactuable mas cercano (solo si no hay un modal abierto)
  const near = activeModal ? null : nearestInteractable(x, y)

  // Tecla E para abrir el objeto cercano
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'e' && near && !activeModal) {
        setActiveModal(near.screen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [near, activeModal])

  return (
    <div className="room-viewport" ref={viewportRef}>
      <div
        className="room-stage"
        style={{
          width: ROOM_WIDTH,
          height: ROOM_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <img className="room-bg" src={roomImg} alt="habitacion" draggable="false" />

        {/* Marcadores de zona interactuable (provisional, hasta colocar objetos) */}
        {INTERACTABLES.map((it) => (
          <div
            key={it.id}
            className={`interact-marker${near?.id === it.id ? ' is-near' : ''}`}
            style={{ left: it.pos[0], top: it.pos[1] }}
          >
            <span className="interact-marker__key">E</span>
          </div>
        ))}

        <Character
          x={x}
          y={y}
          facing={facing}
          moving={moving}
          zIndex={behindWall ? 1 : 3}
        />

        {/* Copia del fondo recortada a la pared interna, encima del personaje */}
        <img
          className="wall-overlay"
          src={roomImg}
          alt=""
          aria-hidden="true"
          draggable="false"
          style={{ clipPath: wallClip, WebkitClipPath: wallClip }}
        />
      </div>

      {/* Aviso de interaccion */}
      {near && (
        <div className="room-prompt">
          <span className="room-prompt__key">E</span>
          <span>{near.label}</span>
        </div>
      )}

      {/* Pantalla / modal del objeto activo */}
      {activeModal && (
        <ScreenModal frameId={activeModal} onClose={() => setActiveModal(null)}>
          {activeModal === 'monitor' ? <ProjectsScreen /> : <BreakoutGame />}
        </ScreenModal>
      )}
    </div>
  )
}
