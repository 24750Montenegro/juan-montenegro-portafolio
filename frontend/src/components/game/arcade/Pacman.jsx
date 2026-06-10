// Mini Pac-Man para la TV. Laberinto en grilla con puntos, pildoras de poder
// y 3 fantasmas con IA simple (persiguen / huyen al comer pildora).
// Controles: flechas o WASD para girar, Espacio = empezar / reintentar.
// El easter egg (codigo Konami) vive en ArcadeScreen y pausa este juego.
import { useEffect, useRef } from 'react'
import { useLanguage } from '../../../hooks/useLanguage.js'
import { W, H, PLAY_TOP, pixelText } from './constants.js'

// Leyenda: # pared, . punto, o pildora, G casa de fantasmas, P inicio de pacman
const MAZE = [
  '#####################',
  '#.........#.........#',
  '#o###.###.#.###.###o#',
  '#...................#',
  '#.###.#.#####.#.###.#',
  '#.....#...#...#.....#',
  '#####.###.#.###.#####',
  '#.........G.........#',
  '#####.###.#.###.#####',
  '#.....#...#...#.....#',
  '#.###.#.#####.#.###.#',
  '#...................#',
  '#o###.###.#.###.###o#',
  '#.........P.........#',
  '#####################',
]
const MCOLS = MAZE[0].length
const MROWS = MAZE.length
const CELL = 12
const OX = Math.floor((W - MCOLS * CELL) / 2)
const OY = PLAY_TOP + 8

const DIRS = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
}
const REVERSA = { up: 'down', down: 'up', left: 'right', right: 'left' }
const GHOST_COLORS = ['#ff2e88', '#2cf6c2', '#ff7b00']
const FRIGHT_TIME = 6 // segundos de modo asustado
const PAC_SPEED = 5.4 // celdas por segundo
const GHOST_SPEED = 4.6

export default function Pacman({ scoreRef, pausedRef }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

  const msgsRef = useRef({})
  msgsRef.current = {
    start: t('pacman.hintStart'),
    retry: t('pacman.hintRetry'),
    ready: t('pacman.ready'),
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    // Posiciones fijas del mapa
    let pacStart = [10, 13]
    let ghostStart = [10, 7]
    for (let r = 0; r < MROWS; r += 1) {
      for (let c = 0; c < MCOLS; c += 1) {
        if (MAZE[r][c] === 'P') pacStart = [c, r]
        if (MAZE[r][c] === 'G') ghostStart = [c, r]
      }
    }

    const esPared = (c, r) =>
      c < 0 || c >= MCOLS || r < 0 || r >= MROWS || MAZE[r][c] === '#'

    function crearPuntos() {
      const dots = new Set()
      const power = new Set()
      for (let r = 0; r < MROWS; r += 1) {
        for (let c = 0; c < MCOLS; c += 1) {
          if (MAZE[r][c] === '.') dots.add(`${c},${r}`)
          if (MAZE[r][c] === 'o') power.add(`${c},${r}`)
        }
      }
      return { dots, power }
    }

    const game = {
      state: 'ready', // ready | playing | lost
      score: 0,
      lives: 3,
      level: 1,
      dots: new Set(),
      power: new Set(),
      fright: 0, // segundos restantes de modo asustado
      freeze: 0, // pausa breve con READY! / tras perder vida
      t: 0, // reloj para animaciones
      pac: null,
      ghosts: [],
    }

    // Entidades en grilla: casilla actual, direccion y progreso 0..1 hacia la
    // casilla vecina. La posicion dibujada interpola entre ambas.
    function crearEntidad(tx, ty, dir) {
      return { tx, ty, dir, prog: 0, queued: null }
    }

    function reposicionar() {
      game.pac = crearEntidad(pacStart[0], pacStart[1], 'left')
      game.ghosts = GHOST_COLORS.map((color, i) => ({
        ...crearEntidad(ghostStart[0], ghostStart[1], i % 2 === 0 ? 'left' : 'right'),
        color,
        comido: 0, // segundos hasta reaparecer si fue comido
      }))
      game.fright = 0
      game.freeze = 1.2
    }

    function nuevoNivel() {
      const { dots, power } = crearPuntos()
      game.dots = dots
      game.power = power
      reposicionar()
    }

    function fullReset() {
      game.score = 0
      game.lives = 3
      game.level = 1
      nuevoNivel()
      game.state = 'playing'
    }

    function onAction() {
      if (pausedRef.current) return
      if (game.state === 'ready' || game.state === 'lost') fullReset()
    }

    // Posicion continua (en celdas) de una entidad
    function posicion(e) {
      const [dx, dy] = DIRS[e.dir]
      return [e.tx + dx * e.prog, e.ty + dy * e.prog]
    }

    function abiertas(c, r) {
      return Object.keys(DIRS).filter((d) => {
        const [dx, dy] = DIRS[d]
        return !esPared(c + dx, r + dy)
      })
    }

    // --- Entrada ---
    const KEY_DIRS = {
      arrowup: 'up', w: 'up',
      arrowdown: 'down', s: 'down',
      arrowleft: 'left', a: 'left',
      arrowright: 'right', d: 'right',
    }
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase()
      if (k === ' ' || k === 'spacebar') {
        if (!e.repeat) onAction()
        e.preventDefault()
        return
      }
      if (KEY_DIRS[k] && game.pac) {
        game.pac.queued = KEY_DIRS[k]
        if (k.startsWith('arrow')) e.preventDefault()
      }
    }
    const onPointerDown = () => onAction()
    window.addEventListener('keydown', onKeyDown)
    canvas.addEventListener('pointerdown', onPointerDown)

    // --- Actualizacion ---
    function avanzarPac(dt) {
      const p = game.pac
      // Giro inmediato si es la direccion contraria
      if (p.queued === REVERSA[p.dir] && p.prog > 0) {
        const [dx, dy] = DIRS[p.dir]
        p.tx += dx
        p.ty += dy
        p.prog = 1 - p.prog
        p.dir = p.queued
        p.queued = null
      }
      let resto = PAC_SPEED * (1 + (game.level - 1) * 0.08) * dt
      while (resto > 0) {
        const [dx, dy] = DIRS[p.dir]
        const bloqueado = esPared(p.tx + dx, p.ty + dy)
        if (p.prog === 0) {
          // En el centro de una casilla: aplicar giro en cola si es posible
          if (p.queued && !esPared(p.tx + DIRS[p.queued][0], p.ty + DIRS[p.queued][1])) {
            p.dir = p.queued
            p.queued = null
            continue
          }
          if (bloqueado) break
        }
        const paso = Math.min(resto, 1 - p.prog)
        p.prog += paso
        resto -= paso
        if (p.prog >= 1) {
          p.tx += dx
          p.ty += dy
          p.prog = 0
          comerEnCasilla()
        }
      }
    }

    function comerEnCasilla() {
      const clave = `${game.pac.tx},${game.pac.ty}`
      if (game.dots.delete(clave)) game.score += 10
      if (game.power.delete(clave)) {
        game.score += 50
        game.fright = FRIGHT_TIME
        for (const g of game.ghosts) {
          if (!g.comido) g.dir = REVERSA[g.dir]
        }
      }
      if (game.dots.size === 0 && game.power.size === 0) {
        game.level += 1
        nuevoNivel()
      }
    }

    function avanzarFantasma(g, dt) {
      if (g.comido > 0) {
        g.comido -= dt
        if (g.comido <= 0) {
          Object.assign(g, crearEntidad(ghostStart[0], ghostStart[1], 'left'), { color: g.color, comido: 0 })
        }
        return
      }
      const velocidad = (game.fright > 0 ? GHOST_SPEED * 0.6 : GHOST_SPEED) *
        (1 + (game.level - 1) * 0.08)
      let resto = velocidad * dt
      while (resto > 0) {
        if (g.prog === 0) {
          const opciones = abiertas(g.tx, g.ty)
          const sinReversa = opciones.filter((d) => d !== REVERSA[g.dir])
          const candidatas = sinReversa.length > 0 ? sinReversa : opciones
          g.dir = elegirDireccion(g, candidatas)
        }
        const [dx, dy] = DIRS[g.dir]
        if (esPared(g.tx + dx, g.ty + dy)) break
        const paso = Math.min(resto, 1 - g.prog)
        g.prog += paso
        resto -= paso
        if (g.prog >= 1) {
          g.tx += dx
          g.ty += dy
          g.prog = 0
        }
      }
    }

    function elegirDireccion(g, candidatas) {
      if (candidatas.length === 1) return candidatas[0]
      // 30% aleatorio para que no sean implacables
      if (Math.random() < 0.3) {
        return candidatas[Math.floor(Math.random() * candidatas.length)]
      }
      const [px, py] = posicion(game.pac)
      let mejor = candidatas[0]
      let mejorDist = game.fright > 0 ? -Infinity : Infinity
      for (const d of candidatas) {
        const [dx, dy] = DIRS[d]
        const dist = Math.abs(g.tx + dx - px) + Math.abs(g.ty + dy - py)
        // Asustados maximizan distancia; normales la minimizan
        if (game.fright > 0 ? dist > mejorDist : dist < mejorDist) {
          mejorDist = dist
          mejor = d
        }
      }
      return mejor
    }

    function colisiones() {
      const [px, py] = posicion(game.pac)
      for (const g of game.ghosts) {
        if (g.comido > 0) continue
        const [gx, gy] = posicion(g)
        if (Math.abs(px - gx) + Math.abs(py - gy) < 0.7) {
          if (game.fright > 0) {
            game.score += 200
            g.comido = 2.5
          } else {
            game.lives -= 1
            if (game.lives <= 0) {
              game.state = 'lost'
            } else {
              reposicionar()
            }
            return
          }
        }
      }
    }

    function update(dt) {
      game.t += dt
      if (game.state !== 'playing') return
      if (game.freeze > 0) {
        game.freeze -= dt
        return
      }
      if (game.fright > 0) game.fright = Math.max(0, game.fright - dt)
      avanzarPac(dt)
      for (const g of game.ghosts) avanzarFantasma(g, dt)
      colisiones()
    }

    // --- Dibujo ---
    const cx = (c) => OX + c * CELL + CELL / 2
    const cy = (r) => OY + r * CELL + CELL / 2

    function drawMaze() {
      for (let r = 0; r < MROWS; r += 1) {
        for (let c = 0; c < MCOLS; c += 1) {
          if (MAZE[r][c] === '#') {
            ctx.fillStyle = '#15154a'
            ctx.fillRect(OX + c * CELL, OY + r * CELL, CELL, CELL)
            ctx.fillStyle = '#2b2b8a'
            ctx.fillRect(OX + c * CELL + 1, OY + r * CELL + 1, CELL - 2, CELL - 2)
          }
        }
      }
      // Puntos y pildoras (las pildoras parpadean)
      ctx.fillStyle = '#ffd9a0'
      for (const clave of game.dots) {
        const [c, r] = clave.split(',').map(Number)
        ctx.fillRect(cx(c) - 1, cy(r) - 1, 2, 2)
      }
      if (Math.floor(game.t * 4) % 2 === 0) {
        ctx.fillStyle = '#fffb96'
        for (const clave of game.power) {
          const [c, r] = clave.split(',').map(Number)
          ctx.fillRect(cx(c) - 3, cy(r) - 3, 6, 6)
        }
      }
    }

    function drawPac() {
      const [pcx, pcyy] = posicion(game.pac)
      const x = OX + pcx * CELL + CELL / 2
      const y = OY + pcyy * CELL + CELL / 2
      const r = CELL / 2 - 1
      // Boca animada segun la direccion
      const apertura = 0.25 + 0.2 * Math.sin(game.t * 14)
      const base = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[game.pac.dir]
      ctx.fillStyle = '#fffb96'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.arc(x, y, r, base + apertura, base - apertura + Math.PI * 2)
      ctx.closePath()
      ctx.fill()
    }

    function drawGhost(g) {
      if (g.comido > 0) return
      const [gcx, gcy] = posicion(g)
      const x = OX + gcx * CELL + 1
      const y = OY + gcy * CELL + 1
      const s = CELL - 2
      const parpadeo = game.fright > 0 && game.fright < 2 && Math.floor(game.t * 6) % 2 === 0
      ctx.fillStyle = game.fright > 0 ? (parpadeo ? '#e8e8ff' : '#5e7bff') : g.color
      // Cuerpo: cupula + flecos
      ctx.fillRect(x, y + s * 0.35, s, s * 0.65)
      ctx.beginPath()
      ctx.arc(x + s / 2, y + s * 0.4, s / 2, Math.PI, 0)
      ctx.fill()
      const fleco = s / 5
      ctx.fillStyle = '#07070f'
      for (let i = 0; i < 3; i += 1) {
        ctx.fillRect(x + fleco * (1 + i * 1.5), y + s - 2, fleco * 0.8, 2)
      }
      // Ojos
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x + s * 0.2, y + s * 0.3, 2, 3)
      ctx.fillRect(x + s * 0.6, y + s * 0.3, 2, 3)
    }

    function draw() {
      ctx.fillStyle = '#07070f'
      ctx.fillRect(0, 0, W, H)

      // HUD
      pixelText(ctx, `SCORE ${game.score}`, 8, 14, 8, '#fffb96', 'left')
      pixelText(ctx, `LV ${game.level}`, W / 2, 14, 8, '#2cf6c2', 'center')
      for (let i = 0; i < game.lives; i += 1) {
        ctx.fillStyle = '#fffb96'
        ctx.fillRect(W - 10 - i * 12, 9, 8, 8)
      }
      ctx.strokeStyle = '#1c1c33'
      ctx.beginPath()
      ctx.moveTo(0, PLAY_TOP - 2)
      ctx.lineTo(W, PLAY_TOP - 2)
      ctx.stroke()

      if (game.state === 'ready') {
        pixelText(ctx, 'PAC-MAN', W / 2, H / 2 - 14, 16, '#fffb96')
        pixelText(ctx, msgsRef.current.start, W / 2, H / 2 + 16, 8, '#cfe9ff')
        return
      }

      drawMaze()
      drawPac()
      for (const g of game.ghosts) drawGhost(g)

      if (game.state === 'lost') {
        ctx.fillStyle = 'rgba(7,7,15,0.78)'
        ctx.fillRect(0, PLAY_TOP, W, H - PLAY_TOP)
        pixelText(ctx, 'GAME OVER', W / 2, H / 2 - 12, 14, '#ff4d6d')
        pixelText(ctx, msgsRef.current.retry, W / 2, H / 2 + 16, 7, '#cfe9ff')
      } else if (game.freeze > 0) {
        pixelText(ctx, msgsRef.current.ready, W / 2, H / 2 + 30, 10, '#2cf6c2')
      }
    }

    // --- Bucle ---
    let raf
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!pausedRef.current) {
        update(dt)
        draw()
        if (scoreRef) scoreRef.current = game.score
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [scoreRef, pausedRef])

  return <canvas ref={canvasRef} width={W} height={H} className="bgame__canvas bgame__canvas--cursor" />
}
