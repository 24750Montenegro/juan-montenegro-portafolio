// Objetos del cuarto con los que se puede interactuar (tecla E).
// pos: punto de anclaje en pixeles de la imagen del cuarto (donde ira el objeto).
// radius: distancia (px de imagen) a la que el jugador puede interactuar.
// screen: que pantalla/modal abre al interactuar.
//
// PERMANENTE: ajusta las posiciones con el editor y pega aqui (reemplazando
// DEFAULT_INTERACTABLES) lo que copie el boton "Exportar interactuables".
export const DEFAULT_INTERACTABLES = [
  {
    id: 'monitor',
    label: 'Proyectos',
    screen: 'monitor',
    pos: [1190, 462],
    radius: 260,
  },
  {
    id: 'tv',
    label: 'Arcade',
    screen: 'tv',
    pos: [839, 1041],
    radius: 260,
  },
]

const STORAGE_KEY = 'room.interactables.v1'

// Carga los interactuables guardados en el navegador; si no hay, usa los del codigo.
export function loadInteractables() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignora storage no disponible o JSON invalido */
  }
  return DEFAULT_INTERACTABLES.map((it) => ({ ...it, pos: [...it.pos] }))
}

// Guarda los interactuables en el navegador (usado por el editor).
export function saveInteractables(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignora storage no disponible */
  }
}

// Borra lo guardado en el navegador (para volver a DEFAULT_INTERACTABLES).
export function clearSavedInteractables() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignora storage no disponible */
  }
}

// Devuelve el interactuable mas cercano dentro de su radio, o null.
export function nearestInteractable(x, y, list = DEFAULT_INTERACTABLES) {
  let best = null
  let bestDist = Infinity
  for (const it of list) {
    const dist = Math.hypot(it.pos[0] - x, it.pos[1] - y)
    if (dist <= it.radius && dist < bestDist) {
      bestDist = dist
      best = it
    }
  }
  return best
}
