import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  WALL_INT,
  WALL_OVERLAY_Z,
  depthZ,
  toClipPath,
} from '../game/geometry'
import { useMovement } from '../game/useMovement'
import { useLanguage } from '../hooks/useLanguage.js'
import { loadInteractables, nearestInteractable } from '../game/interactables'
import { loadPlacements, blockedByObjects, OBJECT_ASSETS } from '../game/objects'
import Character from '../components/game/Character'
import RoomObjects from '../components/game/RoomObjects'
import ScreenModal from '../components/game/ScreenModal'
import RetroWindow from '../components/game/RetroWindow'
import SkillsScreen from '../components/game/SkillsScreen'
import AchievementsScreen from '../components/game/AchievementsScreen'
import SocialScreen from '../components/game/SocialScreen'
import WelcomeModal from '../components/game/WelcomeModal'
import EditorReward from '../components/game/EditorReward'
import roomImg from '../assets/habitación vacia.webp'
import './Room.css'

// Pantallas pesadas cargadas bajo demanda: solo se descargan al interactuar.
const ProjectsScreen = lazy(() => import('../components/game/ProjectsScreen'))
const ArcadeScreen = lazy(() => import('../components/game/arcade/ArcadeScreen'))
const RoomEditor = lazy(() => import('../components/game/RoomEditor')) // EDITOR (temporal)

// Aviso de carga retro para el contenido de las pantallas
const cargandoPantalla = (
  <div className="screen-loading" aria-hidden="true">CARGANDO…</div>
)

// Codigo Konami que revela el boton del editor (easter egg). Se acepta en
// flechas o en WASD (igual que el easter egg del arcade), ambos terminan en B A.
const KONAMI_SECUENCIAS = [
  ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'],
  ['w', 'w', 's', 's', 'a', 'd', 'a', 'd', 'b', 'a'],
]
const KONAMI_LEN = 10

const WELCOME_KEY = 'welcome.seen.v1'

// Zonas que se muestran en una ventana retro (sin marco PNG propio).
// variant cambia el estilo: libro (conocimientos), diploma (logros) o terminal.
// El titulo se traduce en tiempo de render con t('window.<id>').
const WINDOW_SCREENS = {
  conocimientos: { variant: 'book', Component: SkillsScreen },
  logros: { variant: 'medal', Component: AchievementsScreen },
  social: { variant: 'terminal', Component: SocialScreen },
}

// Punto inicial por defecto de los pies (si no hay portal donde aparecer)
const DEFAULT_START = [1300, 1000]

const wallClip = toClipPath(WALL_INT)

// Centro de la cara superior de un portal (donde se para el personaje), en px de imagen.
function portalCenter(portal) {
  const st = OBJECT_ASSETS.portal.stand
  return [portal.x, portal.y - st.dy * portal.scale]
}

// Punto de aparicion: sobre el portal (un poco mas abajo que su centro).
function spawnFrom(placements) {
  const portal = placements.find((p) => p.asset === 'portal')
  if (!portal) return DEFAULT_START
  const st = OBJECT_ASSETS.portal.stand
  return [portal.x, portal.y - st.spawnDy * portal.scale]
}

// Elevacion visual del personaje mientras pisa la cara superior del portal.
// Usa un test de rombo isometrico centrado en la plataforma.
function liftOnPortal(x, y, placements) {
  const portal = placements.find((p) => p.asset === 'portal')
  if (!portal) return 0
  const st = OBJECT_ASSETS.portal.stand
  const [cx, cy] = portalCenter(portal)
  const nx = Math.abs(x - cx) / (st.halfW * portal.scale)
  const ny = Math.abs(y - cy) / (st.halfV * portal.scale)
  return nx + ny <= 1 ? st.lift : 0
}

export default function Room() {
  const { t } = useLanguage()
  // 'monitor' | 'tv' | null. Con un modal abierto se pausa el movimiento.
  const [activeModal, setActiveModal] = useState(null)
  // Objetos colocados en el cuarto.
  const [placements, setPlacements] = useState(loadPlacements)
  // Zonas interactuables (tecla E).
  const [interactables, setInteractables] = useState(loadInteractables)
  // EDITOR (temporal): si esta abierto, pausa el movimiento y muestra el panel.
  const [editorOpen, setEditorOpen] = useState(false)
  // El boton del editor solo aparece tras descubrir el codigo Konami.
  const [editorUnlocked, setEditorUnlocked] = useState(false)
  // Globo de recompensa que aparece al desbloquear (se cierra con clic).
  const [rewardOpen, setRewardOpen] = useState(false)
  // Bienvenida: aparece una vez por sesion del navegador.
  const [welcomeOpen, setWelcomeOpen] = useState(() => {
    try {
      return !sessionStorage.getItem(WELCOME_KEY)
    } catch {
      return true
    }
  })

  // Marca la bienvenida como vista para no repetirla en esta sesion.
  const cerrarWelcome = useCallback(() => {
    try {
      sessionStorage.setItem(WELCOME_KEY, '1')
    } catch {
      /* ignora storage no disponible */
    }
    setWelcomeOpen(false)
  }, [])

  // Detecta el codigo Konami (flechas o WASD) para revelar el editor.
  useEffect(() => {
    let buffer = []
    const onKey = (e) => {
      buffer.push(e.key.toLowerCase())
      if (buffer.length > KONAMI_LEN) buffer = buffer.slice(-KONAMI_LEN)
      const coincide = KONAMI_SECUENCIAS.some(
        (seq) => buffer.length === KONAMI_LEN && seq.every((k, i) => k === buffer[i]),
      )
      if (coincide) {
        setEditorUnlocked(true)
        setRewardOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // El personaje colisiona con la huella de los objetos solidos.
  const isBlocked = useCallback((x, y) => blockedByObjects(x, y, placements), [placements])

  // Punto de aparicion fijado una sola vez (sobre el portal).
  const spawnRef = useRef(null)
  if (spawnRef.current === null) spawnRef.current = spawnFrom(placements)
  const { pos, facing, moving } = useMovement(spawnRef.current, activeModal !== null || editorOpen || welcomeOpen, isBlocked)

  const [scale, setScale] = useState(1)
  const viewportRef = useRef(null)
  const stageRef = useRef(null)

  // Escala la escena para encajar en el viewport conservando proporcion
  useEffect(() => {
    const fit = () => {
      const el = viewportRef.current
      if (!el) return
      const s = Math.min(el.clientWidth / ROOM_WIDTH, el.clientHeight / ROOM_HEIGHT)
      setScale(s)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const [x, y] = pos
  // Elevacion al estar sobre el portal
  const lift = liftOnPortal(x, y, placements)

  // Objeto interactuable mas cercano (solo en juego normal)
  const near = activeModal || editorOpen ? null : nearestInteractable(x, y, interactables)

  // Tecla E para abrir el objeto cercano
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'e' && near && !activeModal && !editorOpen) {
        setActiveModal(near.screen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [near, activeModal, editorOpen])

  return (
    <div className="room-viewport" ref={viewportRef}>
      <div
        className="room-stage"
        ref={stageRef}
        style={{
          width: ROOM_WIDTH,
          height: ROOM_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <img className="room-bg" src={roomImg} alt="habitacion" draggable="false" fetchpriority="high" />

        {/* Objetos colocados (escritorio, monitor, portal, medalla, etc.) */}
        <RoomObjects placements={placements} charPos={pos} />

        {/* Marcadores de zona interactuable (provisional, hasta colocar objetos) */}
        {interactables.map((it) => (
          <div
            key={it.id}
            className={`interact-marker${near?.id === it.id ? ' is-near' : ''}`}
            style={{ left: it.pos[0], top: it.pos[1] }}
          >
            <span className="interact-marker__key">E</span>
          </div>
        ))}

        <Character x={x} y={y} facing={facing} moving={moving} zIndex={depthZ(x, y)} lift={lift} />

        {/* Copia del fondo recortada a la pared interna, encima del personaje */}
        <img
          className="wall-overlay"
          src={roomImg}
          alt=""
          aria-hidden="true"
          draggable="false"
          style={{ clipPath: wallClip, WebkitClipPath: wallClip, zIndex: WALL_OVERLAY_Z }}
        />
      </div>

      {/* Aviso de interaccion */}
      {near && (
        <div className="room-prompt">
          <span className="room-prompt__key">E</span>
          <span>{t(`interact.${near.id}`)}</span>
        </div>
      )}

      {/* Pantalla con marco PNG (monitor / tv) */}
      {(activeModal === 'monitor' || activeModal === 'tv') && (
        <ScreenModal frameId={activeModal} onClose={() => setActiveModal(null)}>
          <Suspense fallback={cargandoPantalla}>
            {activeModal === 'monitor' ? <ProjectsScreen /> : <ArcadeScreen />}
          </Suspense>
        </ScreenModal>
      )}

      {/* Zonas en ventana retro (conocimientos / logros / social) */}
      {WINDOW_SCREENS[activeModal] && (
        <RetroWindow
          title={t(`window.${activeModal}`)}
          variant={WINDOW_SCREENS[activeModal].variant}
          onClose={() => setActiveModal(null)}
        >
          {(() => {
            const Pantalla = WINDOW_SCREENS[activeModal].Component
            return <Pantalla />
          })()}
        </RetroWindow>
      )}

      {/* Bienvenida (una vez por sesion) */}
      {welcomeOpen && <WelcomeModal onClose={cerrarWelcome} />}

      {/* ===== EDITOR (temporal) — borrar este bloque cuando ya no se use ===== */}
      {/* El boton solo aparece tras descubrir el codigo Konami. */}
      {editorUnlocked && rewardOpen && <EditorReward onClose={() => setRewardOpen(false)} />}
      {editorUnlocked && (
        <button
          type="button"
          className="editor-toggle"
          onClick={() => setEditorOpen((o) => !o)}
          title="Modo editor de objetos"
        >
          🛠
        </button>
      )}
      {editorOpen && (
        <Suspense fallback={null}>
          <RoomEditor
            placements={placements}
            setPlacements={setPlacements}
            interactables={interactables}
            setInteractables={setInteractables}
            stageRef={stageRef}
            onClose={() => setEditorOpen(false)}
          />
        </Suspense>
      )}
      {/* ===== fin EDITOR (temporal) ===== */}
    </div>
  )
}
