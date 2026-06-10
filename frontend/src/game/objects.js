// Catalogo de imagenes colocables en el cuarto y persistencia de sus posiciones.
//
// Las imagenes "ya implementadas" (sheets del personaje y fondo del cuarto) NO
// estan aqui. El resto de assets son objetos que se colocan con el editor.
import beanbag from '../assets/beanbag.webp'
import egg from '../assets/egg.webp'
import escritorio from '../assets/escritorio.webp'
import gamingChairSheet from '../assets/gaming-chair1-sheet.webp'
import monitor from '../assets/monitor.webp'
import tablero from '../assets/tablero.webp'
import tv from '../assets/tv.webp'
import medallaSheet from '../assets/medalla1-sheet.webp'
import portalSheet from '../assets/portal1-sheet.webp'
import nintendo from '../assets/nintendo1.webp'
import plantita from '../assets/plantita.webp'
import repisa from '../assets/repisa.webp'
import cama from '../assets/cama.webp'

// kind 'static' = imagen fija. kind 'sprite' = spritesheet horizontal animada.
// native: tamano nativo en px (para sprites, tamano de UN frame).
// sprite.mode: 'step' = cambio de frame instantaneo; 'crossfade' = transicion
//   gradual entre frames (efecto de luz, p.ej. la medalla).
// sprite.fps: cuadros por segundo (todos los frames duran igual). Alternativa:
// sprite.durations: arreglo con la duracion (segundos) de cada frame, para
//   animaciones con tiempos distintos por cuadro (p.ej. el ultimo dura mas).
export const OBJECT_ASSETS = {
  escritorio:  { label: 'Escritorio',  src: escritorio,  kind: 'static', native: { w: 2224, h: 1888 }, wallLayer: true },
  monitor:     { label: 'Monitor',     src: monitor,     kind: 'static', native: { w: 2186, h: 1952 } },
  tv:          { label: 'TV',          src: tv,          kind: 'static', native: { w: 2432, h: 1728 } },
  beanbag:     { label: 'Beanbag',     src: beanbag,     kind: 'static', native: { w: 2380, h: 1792 } },
  tablero:     { label: 'Tablero',     src: tablero,     kind: 'static', native: { w: 1742, h: 2432 }, wallLayer: true },
  egg:         { label: 'Huevo',       src: egg,         kind: 'static', native: { w: 709,  h: 828  } },
  plantita:    { label: 'Plantita',    src: plantita,    kind: 'static', native: { w: 1491, h: 1988 } },
  repisa:      { label: 'Repisa',      src: repisa,      kind: 'static', native: { w: 2816, h: 1536 } },
  cama:        { label: 'Cama',        src: cama,        kind: 'static', native: { w: 1387, h: 1303 } },
  nintendo:    { label: 'Nintendo',    src: nintendo,    kind: 'static', native: { w: 2136, h: 2016 }, fullCollision: true },
  portal: {
    label: 'Portal',
    src: portalSheet,
    kind: 'sprite',
    native: { w: 748, h: 532 },
    noCollision: true, // se puede caminar sobre el
    depthBias: -300, // siempre queda una capa por debajo del personaje (incluso al fondo del portal)
    // Centro de la cara superior de la plataforma (donde se para el personaje) y
    // semiejes del rombo isometrico, medidos en px nativos del frame:
    //   dy      = altura del centro sobre la base del frame
    //   spawnDy = altura del punto de aparicion (menor que dy = un poco mas abajo)
    //   halfW = medio ancho (vertices izq/der)  halfV = media altura (vertices arriba/abajo)
    //   lift  = cuanto se eleva el personaje (px de imagen) al pisar el portal
    stand: { dy: 269, spawnDy: 200, halfW: 366, halfV: 194, lift: 36 },
    // playOnce: anima una sola vez al cargar (efecto de spawn) y luego se queda
    // fijo en el frame restFrame (el primero).
    sprite: { frameW: 748, frameH: 532, frames: 6, mode: 'step', fps: 6, playOnce: true, restFrame: 0 },
  },
  medalla: {
    label: 'Medalla',
    src: medallaSheet,
    kind: 'sprite',
    native: { w: 564, h: 748 },
    sprite: { frameW: 564, frameH: 748, frames: 4, mode: 'crossfade', fps: 2.5 },
  },
  gamingChair: {
    label: 'Silla gamer',
    src: gamingChairSheet,
    kind: 'sprite',
    native: { w: 1696, h: 2472 }, // tamano de UN frame
    // mode 'proximity': muestra nearFrame cuando el personaje esta dentro de
    // radius (px de imagen) y farFrame cuando esta lejos, con fundido suave.
    sprite: { frameW: 1696, frameH: 2472, frames: 2, mode: 'proximity', nearFrame: 0, farFrame: 1, radius: 260 },
  },
}

export const OBJECT_KEYS = Object.keys(OBJECT_ASSETS)

// Escala por defecto para que un objeto recien colocado tenga un alto manejable.
const DEFAULT_DISPLAY_H = 360
export function defaultScale(assetKey) {
  const a = OBJECT_ASSETS[assetKey]
  return +(DEFAULT_DISPLAY_H / a.native.h).toFixed(3)
}

// Huella de colision por defecto (caja en el piso) relativa al ancla (base).
// Centrada algo por encima de la base, ancho ~55% del display y poco alto.
export function defaultCollision(assetKey, scale) {
  const a = OBJECT_ASSETS[assetKey]
  const dispW = a.native.w * scale
  return { w: Math.round(dispW * 0.55), h: 120, dx: 0, dy: -60 }
}

// --- Colocaciones (instancias en el cuarto) ---
// Cada instancia: { id, asset, x, y, scale, flip, solid, collision:{w,h,dx,dy} }
//   x,y  = ancla en px de la imagen, en la base (centro-inferior) del objeto.
//   solid (default true) = si bloquea al personaje con su caja de colision.
//
// PERMANENTE: cuando termines de colocar todo en el editor, pulsa "Exportar JSON"
// y pega el resultado aqui abajo reemplazando este arreglo. Asi las posiciones
// quedan en el codigo y siguen funcionando cuando se elimine el editor.
export const DEFAULT_PLACEMENTS = [
  {
    "id": "escritorio-y0r1h",
    "asset": "escritorio",
    "x": 1125,
    "y": 592,
    "scale": 0.224,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 500,
      "h": 300,
      "dx": 0,
      "dy": -180
    }
  },
  {
    "id": "beanbag-4dm6l",
    "asset": "beanbag",
    "x": 1122,
    "y": 1177,
    "scale": 0.15,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 263,
      "h": 120,
      "dx": 0,
      "dy": -60
    }
  },
  {
    "id": "gamingChair-wbd1z",
    "asset": "gamingChair",
    "x": 1392,
    "y": 777,
    "scale": 0.206,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 120,
      "h": 120,
      "dx": 0,
      "dy": -60
    }
  },
  {
    "id": "portal-3ko2f",
    "asset": "portal",
    "x": 2006,
    "y": 1479,
    "scale": 0.565,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 0,
      "h": 0,
      "dx": 0,
      "dy": -60
    }
  },
  {
    "id": "medalla-iiuhm",
    "asset": "medalla",
    "x": 2173,
    "y": 1014,
    "scale": 0.44,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 149,
      "h": 120,
      "dx": 0,
      "dy": -60
    }
  },
  {
    "id": "nintendo-xi8eo",
    "asset": "nintendo",
    "x": 752,
    "y": 1022,
    "scale": 0.3,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 600,
      "h": 600,
      "dx": -36,
      "dy": -300
    }
  },
  {
    "id": "tablero-50hxw",
    "asset": "tablero",
    "x": 2459,
    "y": 1102,
    "scale": 0.165,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 180,
      "h": 190,
      "dx": -75,
      "dy": -151
    }
  },
  {
    "id": "repisa-9ydox",
    "asset": "repisa",
    "x": 1806,
    "y": 638,
    "scale": 0.242,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 362,
      "h": 120,
      "dx": 0,
      "dy": -190
    }
  },
  {
    "id": "plantita-22i82",
    "asset": "plantita",
    "x": 909,
    "y": 1462,
    "scale": 0.132,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 148,
      "h": 120,
      "dx": 0,
      "dy": -60
    }
  },
  {
    "id": "plantita-oqk4e",
    "asset": "plantita",
    "x": 1977,
    "y": 1043,
    "scale": 0.132,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 148,
      "h": 120,
      "dx": 0,
      "dy": -60
    }
  },
  {
    "id": "cama-iyy0n",
    "asset": "cama",
    "x": 378,
    "y": 1240,
    "scale": 0.368,
    "flip": false,
    "solid": true,
    "collision": {
      "w": 400,
      "h": 300,
      "dx": 65,
      "dy": -140
    }
  }
]

const STORAGE_KEY = 'room.placements.v1'

// Carga las colocaciones guardadas en el navegador; si no hay, usa las del codigo.
export function loadPlacements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignora storage no disponible o JSON invalido */
  }
  return DEFAULT_PLACEMENTS.map((p) => ({ ...p }))
}

// Guarda las colocaciones en el navegador (usado por el editor).
export function savePlacements(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignora storage no disponible */
  }
}

// Borra lo guardado en el navegador (para volver a DEFAULT_PLACEMENTS).
export function clearSavedPlacements() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignora storage no disponible */
  }
}

// true si el punto (x,y) cae dentro de la huella de algun objeto solido.
// - asset.noCollision: nunca bloquea (p.ej. el portal).
// - asset.fullCollision: la huella es toda la imagen (p.ej. la nintendo).
// - en otro caso, usa la caja p.collision (definida en el editor).
export function blockedByObjects(x, y, placements) {
  for (const p of placements) {
    const asset = OBJECT_ASSETS[p.asset]
    if (!asset || asset.noCollision || p.solid === false) continue

    let cx, cy, halfW, halfH
    if (asset.fullCollision) {
      const w = asset.native.w * p.scale
      const h = asset.native.h * p.scale
      cx = p.x
      cy = p.y - h / 2
      halfW = w / 2
      halfH = h / 2
    } else if (p.collision) {
      const c = p.collision
      cx = p.x + (c.dx || 0)
      cy = p.y + (c.dy || 0)
      halfW = c.w / 2
      halfH = c.h / 2
    } else {
      continue
    }

    if (Math.abs(x - cx) <= halfW && Math.abs(y - cy) <= halfH) return true
  }
  return false
}
