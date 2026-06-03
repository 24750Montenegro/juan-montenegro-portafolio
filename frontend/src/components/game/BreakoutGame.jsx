// Mini Breakout para la TV. Canvas pixelart con HUD, vidas y niveles.
// Controles: mover con raton / flechas / A-D, lanzar y reiniciar con Espacio.
// Easter egg: el codigo Konami (↑↑↓↓←→←→BA, en WASD o flechas) dispara una
// explosion de puntaje y revela un huevo que enlaza al Instagram.
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage.js'
import eggImg from '../../assets/egg.png'
import './BreakoutGame.css'

// Resolucion logica del canvas (proporcion ~ a la pantalla de la TV: 1.227)
const W = 328
const H = 268

const PLAY_TOP = 30 // zona reservada para el HUD
const PADDLE_W = 54
const PADDLE_H = 7
const BALL_R = 4

const COLS = 9
const ROWS = 5
const B_GAP = 3
const B_MARGIN = 10
const B_TOP = 40
const B_H = 12
const ROW_COLORS = ['#ff2e88', '#ff7b00', '#fffb96', '#2cf6c2', '#7ad7ff']

// Easter egg (codigo Konami). Se aceptan dos formas: todo WASD o todo flechas;
// en ambas terminan con las letras B y A (como el clasico).
const INSTAGRAM_URL = 'https://www.instagram.com/fmontenegro175/?hl=es'
const KONAMI_WASD = ['w', 'w', 's', 's', 'a', 'd', 'a', 'd', 'b', 'a']
const KONAMI_ARROW = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
]
const EGG_BOOST = 999999 // puntos que suma la animacion
const EGG_RAMP = 1.6 // segundos que tarda en subir el puntaje
const EGG_SHOW_AT = 1.9 // segundos hasta revelar el huevo

export default function BreakoutGame() {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const [showEgg, setShowEgg] = useState(false)

  // Cadenas del HUD que dependen del idioma. Se guardan en un ref para que el
  // bucle del canvas (que solo se monta una vez) lea siempre el valor actual
  // sin reiniciar la partida al cambiar de idioma.
  const msgsRef = useRef({})
  msgsRef.current = {
    spaceClick: t('breakout.hintSpaceClick'),
    spacePlay: t('breakout.hintSpacePlay'),
    spaceRetry: t('breakout.hintSpaceRetry'),
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    const bw = (W - 2 * B_MARGIN - (COLS - 1) * B_GAP) / COLS

    const game = {
      state: 'ready', // ready | playing | won | lost
      score: 0,
      lives: 3,
      level: 1,
      bricks: [],
      paddle: { x: W / 2 - PADDLE_W / 2, vx: 0 },
      ball: { x: W / 2, y: H - 40, vx: 0, vy: 0, speed: 3.4 },
      keys: { left: false, right: false },
      konami: [], // buffer de teclas recientes para el easter egg
      egg: { active: false, t: 0, startScore: 0, shown: false, parts: [] },
    }

    function buildBricks() {
      const bricks = []
      for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) {
          bricks.push({
            x: B_MARGIN + c * (bw + B_GAP),
            y: B_TOP + r * (B_H + B_GAP),
            w: bw,
            h: B_H,
            color: ROW_COLORS[r % ROW_COLORS.length],
            alive: true,
          })
        }
      }
      return bricks
    }

    function resetBall() {
      const p = game.paddle
      game.ball.x = p.x + PADDLE_W / 2
      game.ball.y = H - 24 - BALL_R
      game.ball.vx = 0
      game.ball.vy = 0
    }

    function startLevel() {
      game.bricks = buildBricks()
      game.ball.speed = 3.4 + (game.level - 1) * 0.5
      resetBall()
      game.state = 'ready'
    }

    function launch() {
      const angle = (Math.random() * 0.5 - 0.25) // ligera variacion
      game.ball.vx = game.ball.speed * Math.sin(angle)
      game.ball.vy = -game.ball.speed * Math.cos(angle)
      game.state = 'playing'
    }

    function fullReset() {
      game.score = 0
      game.lives = 3
      game.level = 1
      startLevel()
    }

    function onAction() {
      // Durante el easter egg no se reinicia el juego
      if (game.egg.active) return
      if (game.state === 'ready') launch()
      else if (game.state === 'won' || game.state === 'lost') fullReset()
    }

    function triggerEgg() {
      if (game.egg.active) return
      game.egg.active = true
      game.egg.t = 0
      game.egg.startScore = game.score
      game.egg.shown = false
      // Confeti
      game.egg.parts = Array.from({ length: 46 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: 0.6 + Math.random() * 1.8,
        s: 2 + Math.floor(Math.random() * 3),
        c: ROW_COLORS[Math.floor(Math.random() * ROW_COLORS.length)],
      }))
    }

    // Alimenta el buffer del codigo Konami y dispara el egg si coincide.
    function feedKonami(key) {
      const buf = game.konami
      buf.push(key)
      if (buf.length > 10) buf.shift()
      if (buf.length === 10) {
        const seq = buf.join(',')
        if (seq === KONAMI_WASD.join(',') || seq === KONAMI_ARROW.join(',')) {
          triggerEgg()
          game.konami = []
        }
      }
    }

    startLevel()

    // --- Entrada ---
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase()
      // El codigo se ingresa con pulsaciones discretas (ignora auto-repeticion)
      if (!e.repeat) feedKonami(k)
      if (k === 'arrowleft' || k === 'a') game.keys.left = true
      else if (k === 'arrowright' || k === 'd') game.keys.right = true
      else if (k === ' ' || k === 'spacebar') {
        onAction()
        e.preventDefault()
      }
      if (k.startsWith('arrow')) e.preventDefault()
    }
    const onKeyUp = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'arrowleft' || k === 'a') game.keys.left = false
      else if (k === 'arrowright' || k === 'd') game.keys.right = false
    }
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * W
      game.paddle.x = Math.max(0, Math.min(W - PADDLE_W, mx - PADDLE_W / 2))
    }
    const onPointerDown = () => onAction()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)

    // --- Actualizacion ---
    function updateEgg(f) {
      game.egg.t += f / 60 // segundos aprox.
      const ramp = Math.min(game.egg.t / EGG_RAMP, 1)
      const eased = 1 - (1 - ramp) ** 3
      game.score = Math.floor(game.egg.startScore + eased * EGG_BOOST)
      for (const part of game.egg.parts) {
        part.y += part.vy * f
        if (part.y > H) part.y -= H
      }
      if (game.egg.t >= EGG_SHOW_AT && !game.egg.shown) {
        game.egg.shown = true
        setShowEgg(true)
      }
    }

    function update(f) {
      if (game.egg.active) {
        updateEgg(f)
        return
      }

      const p = game.paddle
      if (game.keys.left) p.x -= 5 * f
      if (game.keys.right) p.x += 5 * f
      p.x = Math.max(0, Math.min(W - PADDLE_W, p.x))

      const b = game.ball
      if (game.state !== 'playing') {
        if (game.state === 'ready') resetBall()
        return
      }

      b.x += b.vx * f
      b.y += b.vy * f

      // Paredes
      if (b.x - BALL_R < 0) { b.x = BALL_R; b.vx = Math.abs(b.vx) }
      if (b.x + BALL_R > W) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx) }
      if (b.y - BALL_R < PLAY_TOP) { b.y = PLAY_TOP + BALL_R; b.vy = Math.abs(b.vy) }

      // Paleta
      const py = H - 24
      if (
        b.vy > 0 &&
        b.y + BALL_R >= py &&
        b.y + BALL_R <= py + PADDLE_H + 6 &&
        b.x >= p.x &&
        b.x <= p.x + PADDLE_W
      ) {
        const hit = (b.x - (p.x + PADDLE_W / 2)) / (PADDLE_W / 2)
        const angle = hit * (Math.PI / 3)
        b.vx = b.speed * Math.sin(angle)
        b.vy = -b.speed * Math.cos(angle)
        b.y = py - BALL_R - 0.1
      }

      // Ladrillos (un impacto por frame)
      for (const brick of game.bricks) {
        if (!brick.alive) continue
        if (
          b.x + BALL_R > brick.x &&
          b.x - BALL_R < brick.x + brick.w &&
          b.y + BALL_R > brick.y &&
          b.y - BALL_R < brick.y + brick.h
        ) {
          brick.alive = false
          game.score += 10
          // Reflejo segun el eje de menor penetracion
          const overlapX = Math.min(b.x + BALL_R - brick.x, brick.x + brick.w - (b.x - BALL_R))
          const overlapY = Math.min(b.y + BALL_R - brick.y, brick.y + brick.h - (b.y - BALL_R))
          if (overlapX < overlapY) b.vx = -b.vx
          else b.vy = -b.vy
          break
        }
      }

      // Cayo por abajo
      if (b.y - BALL_R > H) {
        game.lives -= 1
        if (game.lives <= 0) game.state = 'lost'
        else { game.state = 'ready'; resetBall() }
      }

      // Nivel completado
      if (game.bricks.every((br) => !br.alive)) {
        if (game.level >= 3) game.state = 'won'
        else { game.level += 1; startLevel() }
      }
    }

    // --- Dibujo ---
    function text(str, x, y, size, color, align = 'center') {
      ctx.fillStyle = color
      ctx.font = `${size}px "Press Start 2P", monospace`
      ctx.textAlign = align
      ctx.textBaseline = 'middle'
      ctx.fillText(str, x, y)
    }

    function drawEgg() {
      const t = game.egg.t
      // Fondo que parpadea entre colores
      ctx.fillStyle = `hsl(${(t * 220) % 360}, 65%, 10%)`
      ctx.fillRect(0, 0, W, H)
      // Confeti
      for (const part of game.egg.parts) {
        ctx.fillStyle = part.c
        ctx.fillRect(part.x, part.y, part.s, part.s)
      }
      const flash = Math.floor(t * 10) % 2 === 0
      text('KONAMI', W / 2, H / 2 - 44, 18, flash ? '#fffb96' : '#ff2e88')
      text('CODE!', W / 2, H / 2 - 20, 18, flash ? '#2cf6c2' : '#7ad7ff')
      text(String(game.score).padStart(7, '0'), W / 2, H / 2 + 22, 16, '#ffffff')
      text('+ + + S C O R E + + +', W / 2, H / 2 + 48, 7, '#7cf0c6')
    }

    function draw() {
      if (game.egg.active) {
        drawEgg()
        return
      }

      ctx.fillStyle = '#07070f'
      ctx.fillRect(0, 0, W, H)

      // HUD
      text(`SCORE ${game.score}`, 8, 14, 8, '#fffb96', 'left')
      text(`LV ${game.level}`, W / 2, 14, 8, '#2cf6c2', 'center')
      for (let i = 0; i < game.lives; i += 1) {
        ctx.fillStyle = '#ff2e88'
        ctx.fillRect(W - 10 - i * 12, 9, 8, 8)
      }
      ctx.strokeStyle = '#1c1c33'
      ctx.beginPath()
      ctx.moveTo(0, PLAY_TOP - 2)
      ctx.lineTo(W, PLAY_TOP - 2)
      ctx.stroke()

      // Ladrillos
      for (const br of game.bricks) {
        if (!br.alive) continue
        ctx.fillStyle = br.color
        ctx.fillRect(br.x, br.y, br.w, br.h)
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fillRect(br.x, br.y, br.w, 2)
      }

      // Paleta
      const p = game.paddle
      ctx.fillStyle = '#7ad7ff'
      ctx.fillRect(p.x, H - 24, PADDLE_W, PADDLE_H)

      // Bola
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(game.ball.x - BALL_R, game.ball.y - BALL_R, BALL_R * 2, BALL_R * 2)

      // Mensajes de estado
      if (game.state === 'ready') {
        text('BREAKOUT', W / 2, H / 2 - 14, 14, '#ff2e88')
        text(msgsRef.current.spaceClick, W / 2, H / 2 + 16, 8, '#cfe9ff')
      } else if (game.state === 'won') {
        text('YOU WIN!', W / 2, H / 2 - 12, 16, '#2cf6c2')
        text(msgsRef.current.spacePlay, W / 2, H / 2 + 16, 8, '#cfe9ff')
      } else if (game.state === 'lost') {
        text('GAME OVER', W / 2, H / 2 - 12, 14, '#ff4d6d')
        text(msgsRef.current.spaceRetry, W / 2, H / 2 + 16, 7, '#cfe9ff')
      }
    }

    // --- Bucle ---
    let raf
    let last = performance.now()
    const loop = (now) => {
      const f = Math.min((now - last) / (1000 / 60), 3)
      last = now
      update(f)
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <div className="bgame">
      <canvas ref={canvasRef} width={W} height={H} className="bgame__canvas" />
      <div className="bgame__scanlines" aria-hidden="true" />

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
