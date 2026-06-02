import { useEffect, useRef, useState } from 'react'
import {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  WALL_INT,
  isBehindWall,
  toClipPath,
} from '../game/geometry'
import { useMovement } from '../game/useMovement'
import Character from '../components/game/Character'
import roomImg from '../assets/habitación vacia.png'
import './Room.css'

// Punto inicial de los pies, dentro del piso
const START = [1300, 1000]

const wallClip = toClipPath(WALL_INT)

export default function Room() {
  const { pos, facing, moving } = useMovement(START)
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
    </div>
  )
}
