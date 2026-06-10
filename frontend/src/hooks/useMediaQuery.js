import { useEffect, useState } from 'react'

// Sigue el estado de una media query (p. ej. '(pointer: coarse)' para
// detectar pantallas tactiles u '(orientation: portrait)').
export function useMediaQuery(query) {
  const [coincide, setCoincide] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setCoincide(e.matches)
    setCoincide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return coincide
}
