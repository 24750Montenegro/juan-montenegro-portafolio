import { useEffect, useState } from 'react'
import { OBJECT_ASSETS } from '../../game/objects'
import { depthZ } from '../../game/geometry'
import './RoomObjects.css'

// z-index del objeto: profundidad por su base, con un sesgo opcional del asset
// (p.ej. el portal usa depthBias negativo para quedar siempre bajo el personaje).
function objectZ(p, asset) {
  // Mobiliario pegado a la pared (escritorio, tablero): siempre al fondo, por
  // debajo del personaje y de los demas sprites. Se ordenan entre si por Y.
  if (asset.wallLayer) return 1 + Math.round(p.y / 10)
  return depthZ(p.x, p.y) + (asset.depthBias || 0)
}

// Objeto estatico: una imagen anclada por su base (centro-inferior) en (x,y).
function StaticObject({ p, asset }) {
  const w = asset.native.w * p.scale
  const h = asset.native.h * p.scale
  return (
    <img
      className="room-object"
      src={asset.src}
      alt=""
      draggable="false"
      style={{
        left: p.x - w / 2,
        top: p.y - h,
        width: w,
        height: h,
        zIndex: objectZ(p, asset),
        transform: p.flip ? 'scaleX(-1)' : undefined,
      }}
    />
  )
}

// Reloj continuo en segundos (un solo rAF compartido por instancia animada).
function useClock() {
  const [t, setT] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const loop = (now) => {
      setT((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return t
}

// Frame actual segun un timeline de duraciones por cuadro (en segundos).
function frameFromDurations(t, durations) {
  const total = durations.reduce((a, b) => a + b, 0)
  let tt = t % total
  for (let i = 0; i < durations.length; i++) {
    if (tt < durations[i]) return i
    tt -= durations[i]
  }
  return durations.length - 1
}

// Objeto animado desde una spritesheet horizontal.
function SpriteObject({ p, asset, charPos }) {
  const { frameW, frameH, frames, mode, fps, durations, playOnce, restFrame } = asset.sprite
  const w = frameW * p.scale
  const h = frameH * p.scale
  const t = useClock()

  const base = {
    position: 'absolute',
    left: p.x - w / 2,
    top: p.y - h,
    width: w,
    height: h,
    zIndex: objectZ(p, asset),
    backgroundImage: `url(${asset.src})`,
    backgroundSize: `${w * frames}px ${h}px`,
    backgroundRepeat: 'no-repeat',
  }

  // Por cercania: muestra SOLO nearFrame cuando el personaje esta dentro de
  // radius, y SOLO farFrame cuando esta lejos. Opacidades complementarias (uno
  // sube mientras el otro baja) para un cambio limpio con fundido suave.
  if (mode === 'proximity') {
    const { nearFrame = 0, farFrame = 1, radius = 500 } = asset.sprite
    const near = charPos ? Math.hypot(charPos[0] - p.x, charPos[1] - p.y) <= radius : false
    const flip = p.flip ? 'scaleX(-1)' : undefined
    return (
      <>
        <div
          className="room-object room-object--sprite room-object--fade"
          style={{ ...base, backgroundPosition: `${-farFrame * w}px 0`, opacity: near ? 0 : 1, transform: flip }}
        />
        <div
          className="room-object room-object--sprite room-object--fade"
          style={{ ...base, backgroundPosition: `${-nearFrame * w}px 0`, opacity: near ? 1 : 0, transform: flip }}
        />
      </>
    )
  }

  // Transicion gradual: el frame actual queda fijo y el siguiente se funde
  // encima (sube su opacidad). Da un cambio suave de luz, sin parpadeo.
  if (mode === 'crossfade') {
    const phase = (t * fps) % frames
    const i = Math.floor(phase)
    const next = (i + 1) % frames
    const blend = phase - i
    return (
      <>
        <div
          className="room-object room-object--sprite"
          style={{ ...base, backgroundPosition: `${-i * w}px 0`, transform: p.flip ? 'scaleX(-1)' : undefined }}
        />
        <div
          className="room-object room-object--sprite"
          style={{
            ...base,
            backgroundPosition: `${-next * w}px 0`,
            opacity: blend,
            transform: p.flip ? 'scaleX(-1)' : undefined,
          }}
        />
      </>
    )
  }

  // Cambio de frame instantaneo (animacion clasica de sprites).
  let f
  if (durations) {
    f = frameFromDurations(t, durations)
  } else if (playOnce) {
    // Anima una sola vez (efecto de spawn) y luego se queda fijo en restFrame.
    const cycle = frames / fps
    f = t >= cycle ? restFrame ?? 0 : Math.floor(t * fps) % frames
  } else {
    f = Math.floor(t * fps) % frames
  }
  return (
    <div
      className="room-object room-object--sprite"
      style={{ ...base, backgroundPosition: `${-f * w}px 0`, transform: p.flip ? 'scaleX(-1)' : undefined }}
    />
  )
}

// Renderiza todas las colocaciones del cuarto. El orden de profundidad
// (delante/detras del personaje y de la pared) lo resuelve depthZ via z-index.
// charPos: posicion del personaje, para objetos que reaccionan por cercania.
export default function RoomObjects({ placements, charPos }) {
  return placements.map((p) => {
    const asset = OBJECT_ASSETS[p.asset]
    if (!asset) return null
    return asset.kind === 'sprite' ? (
      <SpriteObject key={p.id} p={p} asset={asset} charPos={charPos} />
    ) : (
      <StaticObject key={p.id} p={p} asset={asset} />
    )
  })
}
