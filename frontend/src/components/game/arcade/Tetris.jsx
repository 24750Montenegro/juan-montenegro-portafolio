// Mini Tetris para la TV. Canvas pixelart con HUD, pieza siguiente y niveles.
// Controles: ←/→ o A/D mover, ↑/W rotar, ↓/S bajar, Espacio = caida dura /
// empezar / reintentar. El easter egg (codigo Konami) vive en ArcadeScreen.
import { useEffect, useRef } from 'react'
import { useLanguage } from '../../../hooks/useLanguage.js'
import { W, H, PLAY_TOP, pixelText } from './constants.js'

const COLS = 10
const ROWS = 20
const CELL = 11
// Tablero centrado: deja libre la esquina inferior izquierda (cruceta en
// pantalla) y la derecha (boton A)
const BOARD_X = 104
const BOARD_Y = PLAY_TOP + 6
const PANEL_X = BOARD_X + COLS * CELL + 22

const SHAPES = {
  I: { color: '#7ad7ff', cells: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { color: '#fffb96', cells: [[1, 1], [1, 1]] },
  T: { color: '#ff2e88', cells: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { color: '#2cf6c2', cells: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { color: '#ff4d6d', cells: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { color: '#5e7bff', cells: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { color: '#ff7b00', cells: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
}

const LINE_SCORE = { 1: 100, 2: 300, 3: 500, 4: 800 }

// Rota una matriz cuadrada en sentido horario
const rotar = (m) => m[0].map((_, i) => m.map((fila) => fila[i]).reverse())

export default function Tetris({ scoreRef, pausedRef }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

  const msgsRef = useRef({})
  msgsRef.current = {
    start: t('tetris.hintStart'),
    retry: t('tetris.hintRetry'),
    lines: t('tetris.lines'),
    next: t('tetris.next'),
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    const game = {
      state: 'ready', // ready | playing | lost
      board: [],
      pieza: null, // { cells, color, x, y }
      bolsa: [],
      siguiente: null,
      score: 0,
      lines: 0,
      level: 1,
      caida: 0, // acumulador de gravedad en ms
    }

    const vacia = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null))

    // Bolsa de 7 piezas barajadas (randomizer clasico moderno)
    function sacarDeBolsa() {
      if (game.bolsa.length === 0) {
        game.bolsa = Object.keys(SHAPES).sort(() => Math.random() - 0.5)
      }
      return game.bolsa.pop()
    }

    function nuevaPieza(tipo) {
      const { cells, color } = SHAPES[tipo]
      return {
        cells: cells.map((f) => [...f]),
        color,
        x: Math.floor((COLS - cells[0].length) / 2),
        y: 0,
      }
    }

    function colisiona(cells, px, py) {
      for (let r = 0; r < cells.length; r += 1) {
        for (let c = 0; c < cells[r].length; c += 1) {
          if (!cells[r][c]) continue
          const x = px + c
          const y = py + r
          if (x < 0 || x >= COLS || y >= ROWS) return true
          if (y >= 0 && game.board[y][x]) return true
        }
      }
      return false
    }

    function spawn() {
      game.pieza = nuevaPieza(game.siguiente)
      game.siguiente = sacarDeBolsa()
      if (colisiona(game.pieza.cells, game.pieza.x, game.pieza.y)) {
        game.state = 'lost'
      }
    }

    function fullReset() {
      game.board = vacia()
      game.score = 0
      game.lines = 0
      game.level = 1
      game.caida = 0
      game.bolsa = []
      game.siguiente = sacarDeBolsa()
      spawn()
      game.state = 'playing'
    }

    function intervaloCaida() {
      return Math.max(110, 750 - (game.level - 1) * 65)
    }

    function fijarPieza() {
      const p = game.pieza
      for (let r = 0; r < p.cells.length; r += 1) {
        for (let c = 0; c < p.cells[r].length; c += 1) {
          if (p.cells[r][c] && p.y + r >= 0) game.board[p.y + r][p.x + c] = p.color
        }
      }
      // Limpieza de lineas completas
      const restantes = game.board.filter((fila) => fila.some((celda) => !celda))
      const limpiadas = ROWS - restantes.length
      if (limpiadas > 0) {
        while (restantes.length < ROWS) restantes.unshift(Array(COLS).fill(null))
        game.board = restantes
        game.score += LINE_SCORE[limpiadas] * game.level
        game.lines += limpiadas
        game.level = 1 + Math.floor(game.lines / 10)
      }
      spawn()
    }

    function mover(dx) {
      const p = game.pieza
      if (!colisiona(p.cells, p.x + dx, p.y)) p.x += dx
    }

    function bajar() {
      const p = game.pieza
      if (!colisiona(p.cells, p.x, p.y + 1)) {
        p.y += 1
        return true
      }
      fijarPieza()
      return false
    }

    function rotarPieza() {
      const p = game.pieza
      const giradas = rotar(p.cells)
      // Patadas de pared simples: intenta en el lugar y a los lados
      for (const dx of [0, -1, 1, -2, 2]) {
        if (!colisiona(giradas, p.x + dx, p.y)) {
          p.cells = giradas
          p.x += dx
          return
        }
      }
    }

    function caidaDura() {
      const p = game.pieza
      while (!colisiona(p.cells, p.x, p.y + 1)) {
        p.y += 1
        game.score += 2
      }
      fijarPieza()
    }

    function onAction() {
      if (pausedRef.current) return
      if (game.state === 'ready' || game.state === 'lost') fullReset()
      else if (game.state === 'playing') caidaDura()
    }

    game.board = vacia()
    game.siguiente = sacarDeBolsa()

    // --- Entrada (por eventos: aprovecha la auto-repeticion del teclado) ---
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase()
      if (k === ' ' || k === 'spacebar') {
        if (!e.repeat) onAction()
        e.preventDefault()
        return
      }
      if (pausedRef.current || game.state !== 'playing') {
        if (k.startsWith('arrow')) e.preventDefault()
        return
      }
      if (k === 'arrowleft' || k === 'a') mover(-1)
      else if (k === 'arrowright' || k === 'd') mover(1)
      else if (k === 'arrowdown' || k === 's') {
        if (bajar()) game.score += 1
        game.caida = 0
      } else if ((k === 'arrowup' || k === 'w') && !e.repeat) rotarPieza()
      if (k.startsWith('arrow')) e.preventDefault()
    }
    const onPointerDown = () => onAction()

    window.addEventListener('keydown', onKeyDown)
    canvas.addEventListener('pointerdown', onPointerDown)

    // --- Dibujo ---
    function celda(x, y, color, tam = CELL) {
      ctx.fillStyle = color
      ctx.fillRect(x, y, tam - 1, tam - 1)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.fillRect(x, y, tam - 1, 2)
    }

    function draw() {
      ctx.fillStyle = '#07070f'
      ctx.fillRect(0, 0, W, H)

      // HUD
      pixelText(ctx, `SCORE ${game.score}`, 8, 14, 8, '#fffb96', 'left')
      pixelText(ctx, `LV ${game.level}`, W - 8, 14, 8, '#2cf6c2', 'right')
      ctx.strokeStyle = '#1c1c33'
      ctx.beginPath()
      ctx.moveTo(0, PLAY_TOP - 2)
      ctx.lineTo(W, PLAY_TOP - 2)
      ctx.stroke()

      // Tablero
      ctx.fillStyle = '#0d0d1d'
      ctx.fillRect(BOARD_X - 2, BOARD_Y - 2, COLS * CELL + 3, ROWS * CELL + 3)
      ctx.strokeStyle = '#2b2b50'
      ctx.strokeRect(BOARD_X - 2.5, BOARD_Y - 2.5, COLS * CELL + 4, ROWS * CELL + 4)
      for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) {
          if (game.board[r][c]) celda(BOARD_X + c * CELL, BOARD_Y + r * CELL, game.board[r][c])
        }
      }

      // Pieza activa
      if (game.state === 'playing' && game.pieza) {
        const p = game.pieza
        for (let r = 0; r < p.cells.length; r += 1) {
          for (let c = 0; c < p.cells[r].length; c += 1) {
            if (p.cells[r][c] && p.y + r >= 0) {
              celda(BOARD_X + (p.x + c) * CELL, BOARD_Y + (p.y + r) * CELL, p.color)
            }
          }
        }
      }

      // Panel lateral: siguiente pieza y lineas
      pixelText(ctx, msgsRef.current.next, PANEL_X + 30, BOARD_Y + 10, 8, '#7a7ab0', 'center')
      ctx.fillStyle = '#0d0d1d'
      ctx.fillRect(PANEL_X, BOARD_Y + 20, 60, 48)
      ctx.strokeStyle = '#2b2b50'
      ctx.strokeRect(PANEL_X + 0.5, BOARD_Y + 20.5, 60, 48)
      if (game.siguiente) {
        const { cells, color } = SHAPES[game.siguiente]
        const mini = 9
        const ancho = cells[0].length * mini
        const ox = PANEL_X + (60 - ancho) / 2
        const oy = BOARD_Y + 20 + (48 - cells.length * mini) / 2
        for (let r = 0; r < cells.length; r += 1) {
          for (let c = 0; c < cells[r].length; c += 1) {
            if (cells[r][c]) celda(ox + c * mini, oy + r * mini, color, mini)
          }
        }
      }
      pixelText(ctx, msgsRef.current.lines, PANEL_X + 30, BOARD_Y + 90, 8, '#7a7ab0', 'center')
      pixelText(ctx, String(game.lines), PANEL_X + 30, BOARD_Y + 106, 10, '#cfe9ff', 'center')

      // Mensajes de estado
      if (game.state === 'ready') {
        pixelText(ctx, 'TETRIS', W / 2, H / 2 - 14, 16, '#2cf6c2')
        pixelText(ctx, msgsRef.current.start, W / 2, H / 2 + 16, 8, '#cfe9ff')
      } else if (game.state === 'lost') {
        ctx.fillStyle = 'rgba(7,7,15,0.78)'
        ctx.fillRect(0, PLAY_TOP, W, H - PLAY_TOP)
        pixelText(ctx, 'GAME OVER', W / 2, H / 2 - 12, 14, '#ff4d6d')
        pixelText(ctx, msgsRef.current.retry, W / 2, H / 2 + 16, 7, '#cfe9ff')
      }
    }

    // --- Bucle ---
    let raf
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(now - last, 50)
      last = now
      if (!pausedRef.current) {
        if (game.state === 'playing') {
          game.caida += dt
          if (game.caida >= intervaloCaida()) {
            game.caida = 0
            bajar()
          }
        }
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
