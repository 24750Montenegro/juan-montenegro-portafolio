import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  WALL_INT,
  WALL_OVERLAY_Z,
  depthZ,
  toClipPath,
} from '../game/geometry'
import { useMovement } from '../game/useMovement'
import { loadInteractables, nearestInteractable } from '../game/interactables'
import { loadPlacements, blockedByObjects, OBJECT_ASSETS } from '../game/objects'
import Character from '../components/game/Character'
import RoomObjects from '../components/game/RoomObjects'
import ScreenModal from '../components/game/ScreenModal'
import RetroWindow from '../components/game/RetroWindow'
import ProjectsScreen from '../components/game/ProjectsScreen'
import BreakoutGame from '../components/game/BreakoutGame'
import SkillsScreen from '../components/game/SkillsScreen'
import AchievementsScreen from '../components/game/AchievementsScreen'
import SocialScreen from '../components/game/SocialScreen'
import RoomEditor from '../components/game/RoomEditor' // EDITOR (temporal)
import roomImg from '../assets/habitación vacia.png'
import './Room.css'

// Zonas que se muestran en una ventana retro (sin marco PNG propio).
// variant cambia el estilo: libro (conocimientos), diploma (logros) o terminal.
const WINDOW_SCREENS = {
  conocimientos: { title: 'Mis Conocimientos', variant: 'book', Component: SkillsScreen },
  logros: { title: 'Mis Logros', variant: 'medal', Component: AchievementsScreen },
  social: { title: 'SOCIAL.EXE', variant: 'terminal', Component: SocialScreen },
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
  // 'monitor' | 'tv' | null. Con un modal abierto se pausa el movimiento.
  const [activeModal, setActiveModal] = useState(null)
  // Objetos colocados en el cuarto.
  const [placements, setPlacements] = useState(loadPlacements)
  // Zonas interactuables (tecla E).
  const [interactables, setInteractables] = useState(loadInteractables)
  // EDITOR (temporal): si esta abierto, pausa el movimiento y muestra el panel.
  const [editorOpen, setEditorOpen] = useState(false)

  // El personaje colisiona con la huella de los objetos solidos.
  const isBlocked = useCallback((x, y) => blockedByObjects(x, y, placements), [placements])

  // Punto de aparicion fijado una sola vez (sobre el portal).
  const spawnRef = useRef(null)
  if (spawnRef.current === null) spawnRef.current = spawnFrom(placements)
  const { pos, facing, moving } = useMovement(spawnRef.current, activeModal !== null || editorOpen, isBlocked)

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
        <img className="room-bg" src={roomImg} alt="habitacion" draggable="false" />

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
          <span>{near.label}</span>
        </div>
      )}

      {/* Pantalla con marco PNG (monitor / tv) */}
      {(activeModal === 'monitor' || activeModal === 'tv') && (
        <ScreenModal frameId={activeModal} onClose={() => setActiveModal(null)}>
          {activeModal === 'monitor' ? <ProjectsScreen /> : <BreakoutGame />}
        </ScreenModal>
      )}

      {/* Zonas en ventana retro (conocimientos / logros / social) */}
      {WINDOW_SCREENS[activeModal] && (
        <RetroWindow
          title={WINDOW_SCREENS[activeModal].title}
          variant={WINDOW_SCREENS[activeModal].variant}
          onClose={() => setActiveModal(null)}
        >
          {(() => {
            const Pantalla = WINDOW_SCREENS[activeModal].Component
            return <Pantalla />
          })()}
        </RetroWindow>
      )}

      {/* ===== EDITOR (temporal) — borrar este bloque cuando ya no se use ===== */}
      <button
        type="button"
        className="editor-toggle"
        onClick={() => setEditorOpen((o) => !o)}
        title="Modo editor de objetos"
      >
        🛠
      </button>
      {editorOpen && (
        <RoomEditor
          placements={placements}
          setPlacements={setPlacements}
          interactables={interactables}
          setInteractables={setInteractables}
          stageRef={stageRef}
          onClose={() => setEditorOpen(false)}
        />
      )}
      {/* ===== fin EDITOR (temporal) ===== */}
    </div>
  )
}
