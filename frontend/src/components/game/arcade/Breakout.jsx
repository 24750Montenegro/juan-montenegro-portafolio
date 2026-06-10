// Mini Breakout para la TV. Canvas pixelart con HUD, vidas y niveles.
// Controles: mover con raton / flechas / A-D, lanzar y reiniciar con Espacio.
// El easter egg (codigo Konami) vive en ArcadeScreen y pausa este juego.
import { useEffect, useRef } from 'react'
import { useLanguage } from '../../../hooks/useLanguage.js'
import { W, H, PLAY_TOP, PALETTE, pixelText } from './constants.js'

const PADDLE_W = 54
const PADDLE_H = 7
const BALL_R = 4

const COLS = 9
const ROWS = 5
const B_GAP = 3
const B_MARGIN = 10
const B_TOP = 40
const B_H = 12

export default function Breakout({ scoreRef, pausedRef }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

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
            color: PALETTE[r % PALETTE.length],
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
      if (pausedRef.current) return
      if (game.state === 'ready') launch()
      else if (game.state === 'won' || game.state === 'lost') fullReset()
    }

    startLevel()

    // --- Entrada ---
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase()
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
    function update(f) {
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
    function draw() {
      ctx.fillStyle = '#07070f'
      ctx.fillRect(0, 0, W, H)

      // HUD
      pixelText(ctx, `SCORE ${game.score}`, 8, 14, 8, '#fffb96', 'left')
      pixelText(ctx, `LV ${game.level}`, W / 2, 14, 8, '#2cf6c2', 'center')
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
        pixelText(ctx, 'BREAKOUT', W / 2, H / 2 - 14, 14, '#ff2e88')
        pixelText(ctx, msgsRef.current.spaceClick, W / 2, H / 2 + 16, 8, '#cfe9ff')
      } else if (game.state === 'won') {
        pixelText(ctx, 'YOU WIN!', W / 2, H / 2 - 12, 16, '#2cf6c2')
        pixelText(ctx, msgsRef.current.spacePlay, W / 2, H / 2 + 16, 8, '#cfe9ff')
      } else if (game.state === 'lost') {
        pixelText(ctx, 'GAME OVER', W / 2, H / 2 - 12, 14, '#ff4d6d')
        pixelText(ctx, msgsRef.current.spaceRetry, W / 2, H / 2 + 16, 7, '#cfe9ff')
      }
    }

    // --- Bucle ---
    let raf
    let last = performance.now()
    const loop = (now) => {
      const f = Math.min((now - last) / (1000 / 60), 3)
      last = now
      if (!pausedRef.current) {
        update(f)
        draw()
        if (scoreRef) scoreRef.current = game.score
      }
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
  }, [scoreRef, pausedRef])

  return <canvas ref={canvasRef} width={W} height={H} className="bgame__canvas" />
}
