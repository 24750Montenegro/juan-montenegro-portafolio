// Arcade de la TV: menu retro para elegir juego (Breakout, Tetris, Pac-Man).
// El codigo Konami (↑↑↓↓←→←→BA, en WASD o flechas) funciona en cualquier
// juego y tambien en el menu: pausa lo que este corriendo y muestra el
// easter egg con la explosion de puntaje.
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../hooks/useLanguage.js'
import { createKonamiDetector } from './konami.js'
import Breakout from './Breakout.jsx'
import Tetris from './Tetris.jsx'
import Pacman from './Pacman.jsx'
import EggOverlay from './EggOverlay.jsx'
import './arcade.css'

const GAMES = [
  { id: 'breakout', label: 'BREAKOUT', color: '#ff2e88', Component: Breakout },
  { id: 'tetris', label: 'TETRIS', color: '#2cf6c2', Component: Tetris },
  { id: 'pacman', label: 'PAC-MAN', color: '#fffb96', Component: Pacman },
]

export default function ArcadeScreen() {
  const { t } = useLanguage()
  const [gameId, setGameId] = useState(null) // null = menu
  const [cursor, setCursor] = useState(0)
  const [eggActive, setEggActive] = useState(false)

  // Puntaje del juego activo (el egg arranca su animacion desde ese valor) y
  // bandera de pausa que los juegos leen en su bucle de canvas.
  const scoreRef = useRef(0)
  const pausedRef = useRef(false)
  pausedRef.current = eggActive

  // Detector del codigo Konami activo en todo el arcade
  useEffect(() => {
    const detecta = createKonamiDetector()
    const onKey = (e) => {
      // Se ingresa con pulsaciones discretas (ignora auto-repeticion)
      if (!e.repeat && detecta(e.key.toLowerCase())) setEggActive(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Navegacion del menu con teclado
  useEffect(() => {
    if (gameId !== null) return undefined
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'arrowup' || k === 'w') {
        setCursor((c) => (c + GAMES.length - 1) % GAMES.length)
        e.preventDefault()
      } else if (k === 'arrowdown' || k === 's') {
        setCursor((c) => (c + 1) % GAMES.length)
        e.preventDefault()
      } else if (k === 'enter' || k === ' ') {
        setGameId(GAMES[cursor].id)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameId, cursor])

  // Tecla M vuelve al menu desde cualquier juego
  useEffect(() => {
    if (gameId === null) return undefined
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'm') {
        scoreRef.current = 0
        setGameId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameId])

  const juego = GAMES.find((g) => g.id === gameId)

  return (
    <div className="bgame">
      {juego ? (
        <>
          {/* key fuerza partida nueva al reentrar al mismo juego */}
          <juego.Component key={juego.id} scoreRef={scoreRef} pausedRef={pausedRef} />
          <button
            type="button"
            className="arcade-menu-btn"
            onClick={() => {
              scoreRef.current = 0
              setGameId(null)
            }}
          >
            ◄ {t('arcade.menu')}
          </button>
        </>
      ) : (
        <div className="arcade-menu">
          <p className="arcade-menu__title">ARCADE</p>
          <p className="arcade-menu__sub">{t('arcade.choose')}</p>
          <ul className="arcade-menu__list">
            {GAMES.map((g, i) => (
              <li key={g.id}>
                <button
                  type="button"
                  className={`arcade-menu__item${i === cursor ? ' is-active' : ''}`}
                  style={{ '--game-color': g.color }}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => setGameId(g.id)}
                >
                  <span className="arcade-menu__cursor" aria-hidden="true">►</span>
                  {g.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="arcade-menu__hint">{t('arcade.hintNav')}</p>
        </div>
      )}

      <div className="bgame__scanlines" aria-hidden="true" />
      {eggActive && <EggOverlay startScore={scoreRef.current} />}
    </div>
  )
}
