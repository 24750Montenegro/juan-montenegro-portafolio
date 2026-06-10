import { useEffect, useRef, useState } from 'react'
import abajoSheet from '../../assets/abajo1-sheet.webp'
import arribaSheet from '../../assets/arriba1-sheet.webp'
import ladoSheet from '../../assets/lado-derecha-sheet.webp'
import './Character.css'

// Altura visible del personaje (la parte dibujada, no el lienzo) en pixeles
// de imagen. Es el alto al que se iguala el personaje en todas las direcciones.
export const CHAR_VISIBLE_H = 415

// Cuadros por segundo de la caminata.
const WALK_FPS = 8

// Spritesheets: cada una es una tira horizontal de frames del mismo tamano.
// frameW/frameH: dimensiones nativas del frame en la imagen.
// drawnH: alto real del personaje (pixeles opacos) dentro del frame, medido
//   sobre la imagen. Cada lienzo trae distinto relleno vacio, asi que escalamos
//   por este valor (no por frameH) para que el personaje se vea del mismo alto.
// flip: la izquierda reusa la sheet de la derecha con espejo horizontal.
const SHEETS = {
  down: { src: abajoSheet, frames: 6, frameW: 260, frameH: 447, drawnH: 432, flip: false },
  up: { src: arribaSheet, frames: 7, frameW: 241, frameH: 458, drawnH: 434, flip: false },
  right: { src: ladoSheet, frames: 4, frameW: 683 / 4, frameH: 365, drawnH: 358, flip: false },
  left: { src: ladoSheet, frames: 4, frameW: 683 / 4, frameH: 365, drawnH: 358, flip: true },
}

// Tamano de despliegue del frame en pixeles de imagen. Escala uniforme (sin
// distorsion) tal que el personaje dibujado mida CHAR_VISIBLE_H de alto.
function sizeOf(sheet) {
  const scale = CHAR_VISIBLE_H / sheet.drawnH
  return {
    w: sheet.frameW * scale,
    h: sheet.frameH * scale,
  }
}

// Personaje anclado por los pies en (x, y), en pixeles de la imagen del cuarto.
// lift: elevacion visual en el eje Y (p.ej. al pararse sobre el portal).
export default function Character({ x, y, facing, moving, zIndex, lift = 0 }) {
  const sheet = SHEETS[facing] || SHEETS.down

  const [frame, setFrame] = useState(0)
  const frameRef = useRef(0)

  // Avanza el ciclo de caminata solo mientras se mueve; quieto vuelve al frame 0.
  useEffect(() => {
    if (!moving) {
      frameRef.current = 0
      setFrame(0)
      return
    }
    let raf
    let last = performance.now()
    const step = 1000 / WALK_FPS
    const loop = (now) => {
      if (now - last >= step) {
        last = now
        frameRef.current = (frameRef.current + 1) % sheet.frames
        setFrame(frameRef.current)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [moving, sheet.frames])

  const { w, h } = sizeOf(sheet)
  // Acota por si la direccion cambio a una sheet con menos frames.
  const f = frame % sheet.frames

  return (
    <div
      className="character"
      data-facing={facing}
      style={{
        left: x - w / 2,
        top: y - h,
        marginTop: -lift,
        width: w,
        height: h,
        zIndex,
        backgroundImage: `url(${sheet.src})`,
        backgroundSize: `${w * sheet.frames}px ${h}px`,
        backgroundPosition: `${-f * w}px 0`,
        transform: sheet.flip ? 'scaleX(-1)' : undefined,
      }}
    />
  )
}
