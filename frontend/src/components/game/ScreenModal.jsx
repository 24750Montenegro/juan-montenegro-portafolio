import { useEffect } from 'react'
import { SCREEN_FRAMES } from './screens'
import './ScreenModal.css'

// Modal con forma de pantalla: muestra el marco pixelart flotando sobre el
// cuarto (atenuado, visible en los bordes) y renderiza `children` dentro del
// area de la pantalla. `frameId` selecciona el marco ('monitor' | 'tv').
export default function ScreenModal({ frameId, onClose, children }) {
  const frame = SCREEN_FRAMES[frameId]

  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!frame) return null

  const { screen } = frame

  return (
    <div className="screen-overlay" onMouseDown={onClose}>
      <div className="screen-frame" onMouseDown={(e) => e.stopPropagation()}>
        <img className="screen-frame__img" src={frame.src} alt="" draggable="false" />
        <div
          className="screen-frame__content"
          style={{
            left: `${screen.left}%`,
            top: `${screen.top}%`,
            right: `${screen.right}%`,
            bottom: `${screen.bottom}%`,
          }}
        >
          {children}
        </div>
        <button
          type="button"
          className="screen-frame__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
