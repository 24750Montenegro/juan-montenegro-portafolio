// Easter egg compartido del arcade: al ingresar el codigo Konami en cualquier
// juego se dibuja una explosion de puntaje con confeti y luego se revela un
// huevo que enlaza al Instagram. Es independiente del juego activo (canvas
// propio encima del juego, que queda pausado mientras tanto).
import { useEffect, useRef, useState } from 'react'
import { W, H, PALETTE, pixelText } from './constants.js'
import eggImg from '../../../assets/egg.webp'

const INSTAGRAM_URL = 'https://www.instagram.com/fmontenegro175/?hl=es'
const EGG_BOOST = 999999 // puntos que suma la animacion
const EGG_RAMP = 1.6 // segundos que tarda en subir el puntaje
const EGG_SHOW_AT = 1.9 // segundos hasta revelar el huevo

export default function EggOverlay({ startScore = 0 }) {
  const canvasRef = useRef(null)
  const [showEgg, setShowEgg] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    let t = 0
    let shown = false
    const parts = Array.from({ length: 46 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: 0.6 + Math.random() * 1.8,
      s: 2 + Math.floor(Math.random() * 3),
      c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    }))

    let raf
    let last = performance.now()
    const loop = (now) => {
      const f = Math.min((now - last) / (1000 / 60), 3)
      last = now
      t += f / 60

      const ramp = Math.min(t / EGG_RAMP, 1)
      const eased = 1 - (1 - ramp) ** 3
      const score = Math.floor(startScore + eased * EGG_BOOST)

      ctx.fillStyle = `hsl(${(t * 220) % 360}, 65%, 10%)`
      ctx.fillRect(0, 0, W, H)
      for (const part of parts) {
        part.y += part.vy * f
        if (part.y > H) part.y -= H
        ctx.fillStyle = part.c
        ctx.fillRect(part.x, part.y, part.s, part.s)
      }
      const flash = Math.floor(t * 10) % 2 === 0
      pixelText(ctx, 'KONAMI', W / 2, H / 2 - 44, 18, flash ? '#fffb96' : '#ff2e88')
      pixelText(ctx, 'CODE!', W / 2, H / 2 - 20, 18, flash ? '#2cf6c2' : '#7ad7ff')
      pixelText(ctx, String(score).padStart(7, '0'), W / 2, H / 2 + 22, 16, '#ffffff')
      pixelText(ctx, '+ + + S C O R E + + +', W / 2, H / 2 + 48, 7, '#7cf0c6')

      if (t >= EGG_SHOW_AT && !shown) {
        shown = true
        setShowEgg(true)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [startScore])

  return (
    <div className="arcade-egg-layer">
      <canvas ref={canvasRef} width={W} height={H} className="bgame__canvas" />
      {showEgg && (
        <a
          className="bgame__egg"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="bgame__egg-img" src={eggImg} alt="Easter egg" draggable="false" />
          <span className="bgame__egg-hint">¡click! → @fmontenegro175</span>
        </a>
      )}
    </div>
  )
}
