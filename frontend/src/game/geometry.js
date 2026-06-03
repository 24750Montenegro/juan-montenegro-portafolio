// Geometria de la habitacion en pixeles de la imagen original
export const ROOM_WIDTH = 2816
export const ROOM_HEIGHT = 1536

// Poligonos extraidos del image map (coords en pixeles de la imagen)
export const FLOOR = [
  [129, 1060],
  [927, 1454],
  [1462, 1180],
  [2015, 1471],
  [2717, 1111],
  [1331, 449],
]

export const WALL_INT = [
  [2299, 443],
  [1637, 788],
  [1628, 1278],
  [1798, 1214],
  [1798, 791],
  [1969, 723],
  [1969, 1123],
  [2311, 934],
]

// Direccion hacia el frente en isometrico (abajo-derecha)
const FORWARD = [0.81, 0.58]
// Margen de choque a cada lado de la linea de la pared
const WALL_FRONT = 50 // hacia el jugador (choque desde abajo)
const WALL_BACK = 90 // hacia atras (choque desde arriba)

// Genera una banda alrededor del borde de la pared, con margen a ambos lados
function band(f0, f1) {
  const fx = FORWARD[0]
  const fy = FORWARD[1]
  const back = (p) => [p[0] - fx * WALL_BACK, p[1] - fy * WALL_BACK]
  const front = (p) => [p[0] + fx * WALL_FRONT, p[1] + fy * WALL_FRONT]
  return [back(f0), back(f1), front(f1), front(f0)]
}

// Banda a lo largo de un segmento usando su propia normal (no FORWARD global),
// para paredes con cualquier inclinacion. front: margen hacia adentro del cuarto;
// back: margen hacia afuera. inward: vector aproximado hacia adentro para orientar
// la normal (su signo, no su magnitud).
function bandAlong(p0, p1, front, back, inward) {
  const dx = p1[0] - p0[0]
  const dy = p1[1] - p0[1]
  const len = Math.hypot(dx, dy) || 1
  let nx = -dy / len
  let ny = dx / len
  if (nx * inward[0] + ny * inward[1] < 0) {
    nx = -nx
    ny = -ny
  }
  const inP = (p) => [p[0] + nx * front, p[1] + ny * front]
  const outP = (p) => [p[0] - nx * back, p[1] - ny * back]
  return [outP(p0), outP(p1), inP(p1), inP(p0)]
}

// Pared exterior derecha (pared exterior 2): borde trasero-derecho del piso.
// Margen de choque hacia adentro del cuarto para no subirse a la pared.
const EXT2_FRONT = 60 // hacia adentro del cuarto (abajo-izquierda)
const EXT2_BACK = 15 // hacia afuera, cubre la linea de la pared

// Pared exterior izquierda (pared exterior 1, la del ventanal): borde trasero-izq.
const EXT1_FRONT = 45 // hacia adentro del cuarto (abajo-derecha)
const EXT1_BACK = 15 // hacia afuera, cubre la linea de la pared

// Huella de la pared interna: dos bandas con la puerta en medio
export const WALL_COLLISION = [
  band([1626, 1267], [1798, 1214]), // segmento izquierdo
  band([1969, 1123], [2305, 906]), // segmento derecho
  // Pared exterior derecha: empuja al jugador hacia adentro (normal abajo-izq)
  bandAlong([1331, 449], [2717, 1111], EXT2_FRONT, EXT2_BACK, [-1, 1]),
  // Pared exterior izquierda: empuja al jugador hacia adentro (normal abajo-der)
  bandAlong([129, 1060], [1331, 449], EXT1_FRONT, EXT1_BACK, [1, 1]),
]

// Borde cercano de la pared interna (P1 abajo-izq, P2 arriba-der): cubre al cruzarlo
export const WALL_DIAGONAL = [
  [1653, 1280],
  [2325, 929],
]

// Pies arriba-izquierda de la diagonal: el personaje va detras de la pared
export function isBehindWall(x, y) {
  const [[x1, y1], [x2, y2]] = WALL_DIAGONAL
  const cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
  return cross < 0
}

// z-index del overlay de la pared interna. Los sprites detras de la pared
// quedan por debajo (z < este valor); los de delante, por encima.
export const WALL_OVERLAY_Z = 1600

// z-index para ordenar por profundidad cualquier sprite anclado por su base
// (personaje y objetos). Detras de la pared: ordenado por Y debajo del overlay.
// Delante: por encima del overlay, y entre si mas abajo (Y mayor) = mas cerca.
export function depthZ(x, y) {
  return isBehindWall(x, y) ? Math.round(y) : WALL_OVERLAY_Z + Math.round(y)
}

// Punto dentro de poligono por ray casting
export function pointInPolygon(x, y, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

// Convierte poligono en pixeles a clip-path en porcentajes
export function toClipPath(polygon, width = ROOM_WIDTH, height = ROOM_HEIGHT) {
  const points = polygon
    .map(([x, y]) => `${(x / width) * 100}% ${(y / height) * 100}%`)
    .join(', ')
  return `polygon(${points})`
}
