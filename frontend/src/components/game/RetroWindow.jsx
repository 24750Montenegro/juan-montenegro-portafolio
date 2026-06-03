import { useEffect } from 'react'
import './RetroWindow.css'

// Ventana modal con estetica retro (sin marco PNG). El `variant` cambia el
// aspecto: 'terminal' (pantalla), 'book' (hojas/libro) o 'medal' (vitrina). Dibuja
// cabecera, boton de cierre y textura, y muestra `children` en un cuerpo
// desplazable. Se usa para las zonas que no tienen marco de pantalla propio.
export default function RetroWindow({
  title,
  user = '~/juan-montenegro',
  variant = 'terminal',
  onClose,
  children,
}) {
  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const esTerminal = variant === 'terminal'

  return (
    <div className="retro-overlay" onMouseDown={onClose}>
      <div className={`retro-window retro-window--${variant}`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="retro-window__bar">
          {esTerminal && <span className="retro-window__dot" />}
          <span className="retro-window__title">{title}</span>
          {esTerminal && <span className="retro-window__user">{user}</span>}
          <button
            type="button"
            className="retro-window__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            X
          </button>
        </header>

        <div className="retro-window__body">{children}</div>

        <div className="retro-window__texture" aria-hidden="true" />
      </div>
    </div>
  )
}
