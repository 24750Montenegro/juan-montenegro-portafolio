// Objetos del cuarto con los que se puede interactuar (tecla E).
// pos: punto de anclaje en pixeles de la imagen del cuarto (donde ira el objeto).
// radius: distancia (px de imagen) a la que el jugador puede interactuar.
// screen: que pantalla/modal abre al interactuar.
//
// NOTA: las posiciones son provisionales. Cuando coloques los sprites de los
// objetos en el cuarto, ajusta `pos` para que coincida con cada mueble.
export const INTERACTABLES = [
  {
    id: 'monitor',
    label: 'Proyectos',
    screen: 'monitor',
    pos: [1980, 760],
    radius: 260,
  },
  {
    id: 'tv',
    label: 'Arcade',
    screen: 'tv',
    pos: [720, 820],
    radius: 260,
  },
]

// Devuelve el interactuable mas cercano dentro de su radio, o null.
export function nearestInteractable(x, y) {
  let best = null
  let bestDist = Infinity
  for (const it of INTERACTABLES) {
    const dist = Math.hypot(it.pos[0] - x, it.pos[1] - y)
    if (dist <= it.radius && dist < bestDist) {
      bestDist = dist
      best = it
    }
  }
  return best
}
