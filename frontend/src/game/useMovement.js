import { useEffect, useRef, useState } from 'react'
import { FLOOR, WALL_COLLISION, pointInPolygon } from './geometry'

// Pisable: dentro del piso y fuera de las bandas de la pared interna
function canWalk(x, y) {
  if (!pointInPolygon(x, y, FLOOR)) return false
  return !WALL_COLLISION.some((band) => pointInPolygon(x, y, band))
}

// Velocidad en pixeles de imagen por segundo
const SPEED = 600

const KEY_MAP = {
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
  arrowup: 'up',
  arrowleft: 'left',
  arrowdown: 'down',
  arrowright: 'right',
}

// Mueve al personaje con WASD y lo mantiene dentro del piso.
// start: punto inicial de los pies (x, y) en pixeles de imagen.
// paused: si es true, ignora el teclado y detiene al personaje (p.ej. con un modal abierto).
// isBlocked(x,y): opcional, true si esa posicion esta ocupada por un objeto solido.
export function useMovement(start, paused = false, isBlocked = null) {
  const [pos, setPos] = useState(start)
  const [facing, setFacing] = useState('down')
  const [moving, setMoving] = useState(false)

  const posRef = useRef(start)
  const keys = useRef({ up: false, down: false, left: false, right: false })
  const pausedRef = useRef(paused)
  const blockedRef = useRef(isBlocked)

  // Mantiene el ref sincronizado y suelta las teclas al pausar.
  useEffect(() => {
    pausedRef.current = paused
    if (paused) keys.current = { up: false, down: false, left: false, right: false }
  }, [paused])

  // Mantiene el detector de objetos al dia sin reiniciar el bucle de animacion.
  useEffect(() => {
    blockedRef.current = isBlocked
  }, [isBlocked])

  useEffect(() => {
    const onDown = (e) => {
      if (pausedRef.current) return
      const dir = KEY_MAP[e.key.toLowerCase()]
      if (dir) {
        keys.current[dir] = true
        e.preventDefault()
      }
    }
    const onUp = (e) => {
      const dir = KEY_MAP[e.key.toLowerCase()]
      if (dir) keys.current[dir] = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    let raf
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (pausedRef.current) {
        setMoving(false)
        raf = requestAnimationFrame(loop)
        return
      }

      let dx = 0
      let dy = 0
      if (keys.current.up) dy -= 1
      if (keys.current.down) dy += 1
      if (keys.current.left) dx -= 1
      if (keys.current.right) dx += 1

      const active = dx !== 0 || dy !== 0
      if (active) {
        // Normaliza diagonal
        const len = Math.hypot(dx, dy)
        dx = (dx / len) * SPEED * dt
        dy = (dy / len) * SPEED * dt

        // Pisable y, ademas, libre de objetos solidos
        const walk = (px, py) =>
          canWalk(px, py) && !(blockedRef.current && blockedRef.current(px, py))

        const [x, y] = posRef.current
        let nx = x
        let ny = y
        // Resuelve cada eje por separado para deslizar sobre los bordes
        if (walk(x + dx, y)) nx = x + dx
        if (walk(nx, y + dy)) ny = y + dy

        if (nx !== x || ny !== y) {
          posRef.current = [nx, ny]
          setPos(posRef.current)
        }

        // Direccion: prioriza el eje dominante
        if (Math.abs(dy) >= Math.abs(dx)) setFacing(dy < 0 ? 'up' : 'down')
        else setFacing(dx < 0 ? 'left' : 'right')
      }
      setMoving(active)

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  return { pos, facing, moving }
}
