// Botonera del arcade: cruceta (izquierda) y botones B/A (derecha), fijos en
// los bordes de la pantalla, FUERA del marco de la TV (como los controles
// tactiles del cuarto). Visibles en desktop y movil. Los botones despachan
// eventos de teclado sinteticos (flechas, 'b', espacio), asi los juegos no
// necesitan logica extra; ademas escucha el teclado fisico para iluminar el
// boton correspondiente. Con B y A se puede ingresar el codigo Konami
// (cruceta + B + A) tambien en tactil.
// Se monta via portal en <body>: el marco de la TV tiene filter/overflow que
// recortarian un position: fixed interno.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../../hooks/useLanguage.js'

const DIRS = [
  { id: 'up', glyph: '▲' },
  { id: 'left', glyph: '◀' },
  { id: 'right', glyph: '▶' },
  { id: 'down', glyph: '▼' },
]

// Tecla sintetica que dispara cada boton
const KEY_FOR = {
  up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
  a: ' ', b: 'b',
}

// Teclas fisicas que iluminan cada boton (eco visual)
const MATCH = {
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
  arrowleft: 'left',
  arrowright: 'right', d: 'right',
  ' ': 'a', spacebar: 'a',
  b: 'b',
}

// Auto-repeticion al mantener presionada una direccion (mover en Tetris)
const REPEAT_MS = 110

export default function ArcadePad() {
  const { t } = useLanguage()
  const [activos, setActivos] = useState({})
  const repeats = useRef({})

  // Eco del teclado: tanto el fisico como los eventos sinteticos propios
  // pasan por window, asi que una sola escucha ilumina los botones.
  useEffect(() => {
    const onDown = (e) => {
      const id = MATCH[e.key.toLowerCase()]
      if (id) setActivos((p) => (p[id] ? p : { ...p, [id]: true }))
    }
    const onUp = (e) => {
      const id = MATCH[e.key.toLowerCase()]
      if (id) setActivos((p) => ({ ...p, [id]: false }))
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      for (const idInterval of Object.values(repeats.current)) clearInterval(idInterval)
    }
  }, [])

  const fire = (id, type, repeat = false) =>
    window.dispatchEvent(new KeyboardEvent(type, { key: KEY_FOR[id], repeat }))

  const limpiar = (id) => {
    clearInterval(repeats.current[id])
    delete repeats.current[id]
  }

  const press = (id) => (e) => {
    e.preventDefault()
    // Captura el puntero: el keyup llega aunque el dedo se deslice fuera
    e.currentTarget.setPointerCapture?.(e.pointerId)
    fire(id, 'keydown')
    if (id !== 'a' && id !== 'b') {
      limpiar(id)
      repeats.current[id] = setInterval(() => fire(id, 'keydown', true), REPEAT_MS)
    }
  }

  const release = (id) => () => {
    limpiar(id)
    fire(id, 'keyup')
  }

  const botonProps = (id) => ({
    onPointerDown: press(id),
    onPointerUp: release(id),
    onPointerCancel: release(id),
    onLostPointerCapture: release(id),
  })

  return createPortal(
    <div className="arcade-pad" onContextMenu={(e) => e.preventDefault()}>
      <div className="arcade-pad__dpad">
        {DIRS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`arcade-pad__btn arcade-pad__btn--${d.id}${activos[d.id] ? ' is-down' : ''}`}
            aria-label={t(`touch.${d.id}`)}
            {...botonProps(d.id)}
          >
            {d.glyph}
          </button>
        ))}
        <span className="arcade-pad__mid" aria-hidden="true" />
      </div>

      <button
        type="button"
        className={`arcade-pad__action arcade-pad__action--b${activos.b ? ' is-down' : ''}`}
        aria-label="B"
        {...botonProps('b')}
      >
        B
      </button>
      <button
        type="button"
        className={`arcade-pad__action arcade-pad__action--a${activos.a ? ' is-down' : ''}`}
        aria-label={t('arcade.action')}
        {...botonProps('a')}
      >
        A
      </button>
    </div>,
    document.body,
  )
}
