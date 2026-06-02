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

// Linea frontal de la pared interna: bajo ella el personaje va por delante
export const WALL_INT_FRONT_Y = 1278

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
