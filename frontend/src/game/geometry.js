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

// Huella de la pared interna: dos bandas finas (ancho isometrico) con la puerta en medio
export const WALL_COLLISION = [
  // Segmento izquierdo de la puerta
  [
    [1626, 1267],
    [1798, 1214],
    [1823, 1232],
    [1653, 1280],
  ],
  // Segmento derecho de la puerta
  [
    [1969, 1123],
    [2305, 906],
    [2325, 929],
    [1994, 1141],
  ],
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
