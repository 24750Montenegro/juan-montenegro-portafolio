// Controles tactiles para moviles: cruceta de movimiento a la izquierda y
// boton de interaccion (reemplaza la tecla E) a la derecha. Solo se montan
// en pantallas tactiles (pointer: coarse); en desktop no aparecen.
import { useLanguage } from '../../hooks/useLanguage.js'
import './TouchControls.css'

const DIRS = [
  { id: 'up', glyph: '▲' },
  { id: 'left', glyph: '◀' },
  { id: 'right', glyph: '▶' },
  { id: 'down', glyph: '▼' },
]

export default function TouchControls({ onDir, onInteract, nearLabel }) {
  const { t } = useLanguage()

  // Cada boton presiona/suelta su direccion como si fuera una tecla. Se
  // suelta tambien en cancel/leave para no dejar al personaje caminando solo.
  const press = (dir, pressed) => (e) => {
    e.preventDefault()
    onDir(dir, pressed)
  }

  return (
    <div className="touch-controls" onContextMenu={(e) => e.preventDefault()}>
      <div className="touch-dpad">
        {DIRS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`touch-dpad__btn touch-dpad__btn--${d.id}`}
            aria-label={t(`touch.${d.id}`)}
            onPointerDown={press(d.id, true)}
            onPointerUp={press(d.id, false)}
            onPointerCancel={press(d.id, false)}
            onPointerLeave={press(d.id, false)}
          >
            {d.glyph}
          </button>
        ))}
        <span className="touch-dpad__center" aria-hidden="true" />
      </div>

      <button
        type="button"
        className={`touch-interact${nearLabel ? ' is-active' : ''}`}
        disabled={!nearLabel}
        aria-label={nearLabel || t('touch.interact')}
        onClick={onInteract}
      >
        E
      </button>
    </div>
  )
}
