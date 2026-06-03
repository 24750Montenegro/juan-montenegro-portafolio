// ============================================================================
//  EDITOR DE OBJETOS (TEMPORAL)
//  Permite colocar/mover/escalar objetos y mover las zonas interactuables (E),
//  y guardar/exportar esas posiciones. Cuando ya no se necesite, borra:
//    - este archivo y RoomEditor.css
//    - el bloque marcado "EDITOR (temporal)" en Room.jsx
//  El resto (objects.js, interactables.js, RoomObjects.jsx, colisiones) se queda.
// ============================================================================
import { useEffect, useReducer, useRef, useState } from 'react'
import {
  OBJECT_ASSETS,
  OBJECT_KEYS,
  defaultScale,
  defaultCollision,
  savePlacements,
  clearSavedPlacements,
} from '../../game/objects'
import { saveInteractables, clearSavedInteractables } from '../../game/interactables'
import { FLOOR, WALL_COLLISION, ROOM_WIDTH, ROOM_HEIGHT } from '../../game/geometry'
import './RoomEditor.css'

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export default function RoomEditor({
  placements,
  setPlacements,
  interactables,
  setInteractables,
  stageRef,
  onClose,
}) {
  // Seleccion unificada: { kind: 'object' | 'interact', id } | null
  const [sel, setSel] = useState(null)
  const [showColliders, setShowColliders] = useState(true)
  const [showFloor, setShowFloor] = useState(false)
  const [toast, setToast] = useState('')
  const [, forceTick] = useReducer((c) => c + 1, 0)
  const dragRef = useRef(null) // { kind, id, offX, offY }

  const selObj = sel?.kind === 'object' ? placements.find((p) => p.id === sel.id) : null
  const selInt = sel?.kind === 'interact' ? interactables.find((i) => i.id === sel.id) : null

  // Rect de la escena en pantalla + factor de escala imagen->pantalla.
  const getView = () => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { rect, scale: rect.width / ROOM_WIDTH }
  }
  // Pantalla -> coordenadas de la imagen.
  const toImage = (clientX, clientY) => {
    const view = getView()
    if (!view) return [0, 0]
    return [(clientX - view.rect.left) / view.scale, (clientY - view.rect.top) / view.scale]
  }

  // Recalcula posiciones de los handles cuando cambia el tamano de ventana.
  useEffect(() => {
    window.addEventListener('resize', forceTick)
    return () => window.removeEventListener('resize', forceTick)
  }, [])

  // --- Mutaciones de objetos ---
  const updateObj = (id, patch) =>
    setPlacements((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const updateCollision = (id, patch) =>
    setPlacements((list) =>
      list.map((p) => (p.id === id ? { ...p, collision: { ...p.collision, ...patch } } : p)),
    )

  // --- Mutaciones de interactuables ---
  const updateInt = (id, patch) =>
    setInteractables((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const setIntPos = (id, x, y) =>
    setInteractables((list) => list.map((it) => (it.id === id ? { ...it, pos: [x, y] } : it)))

  const addObject = (assetKey) => {
    const scale = defaultScale(assetKey)
    const inst = {
      id: `${assetKey}-${Math.random().toString(36).slice(2, 7)}`,
      asset: assetKey,
      x: 1400,
      y: 950,
      scale,
      flip: false,
      solid: true,
      collision: defaultCollision(assetKey, scale),
    }
    setPlacements((list) => [...list, inst])
    setSel({ kind: 'object', id: inst.id })
  }

  const removeObject = (id) => {
    setPlacements((list) => list.filter((p) => p.id !== id))
    if (sel?.kind === 'object' && sel.id === id) setSel(null)
  }

  const duplicateObject = (id) => {
    const src = placements.find((p) => p.id === id)
    if (!src) return
    const copy = {
      ...src,
      id: `${src.asset}-${Math.random().toString(36).slice(2, 7)}`,
      x: src.x + 80,
      y: src.y + 40,
      collision: { ...src.collision },
    }
    setPlacements((list) => [...list, copy])
    setSel({ kind: 'object', id: copy.id })
  }

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const save = () => {
    savePlacements(placements)
    saveInteractables(interactables)
    flash('Guardado en este navegador')
  }

  // Borra lo guardado y recarga para volver a los valores del codigo (defaults).
  const resetDefaults = () => {
    if (!window.confirm('¿Descartar lo guardado en el navegador y cargar los valores por defecto del código?')) return
    clearSavedPlacements()
    clearSavedInteractables()
    window.location.reload()
  }

  const copy = (code, msg) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code)
    console.log(code)
    flash(msg)
  }

  const exportObjects = () => {
    const clean = placements.map((p) => ({
      id: p.id,
      asset: p.asset,
      x: Math.round(p.x),
      y: Math.round(p.y),
      scale: +Number(p.scale).toFixed(3),
      flip: !!p.flip,
      solid: p.solid !== false,
      collision: {
        w: Math.round(p.collision.w),
        h: Math.round(p.collision.h),
        dx: Math.round(p.collision.dx),
        dy: Math.round(p.collision.dy),
      },
    }))
    copy(
      `export const DEFAULT_PLACEMENTS = ${JSON.stringify(clean, null, 2)}`,
      'Objetos copiados (pégalos en objects.js)',
    )
  }

  const exportInteractables = () => {
    const clean = interactables.map((it) => ({
      id: it.id,
      label: it.label,
      screen: it.screen,
      pos: [Math.round(it.pos[0]), Math.round(it.pos[1])],
      radius: Math.round(it.radius),
    }))
    copy(
      `export const DEFAULT_INTERACTABLES = ${JSON.stringify(clean, null, 2)}`,
      'Zonas E copiadas (pégalas en interactables.js)',
    )
  }

  // --- Arrastre (objetos e interactuables) ---
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current
      if (!d) return
      const [ix, iy] = toImage(e.clientX, e.clientY)
      const nx = Math.round(clamp(ix - d.offX, 0, ROOM_WIDTH))
      const ny = Math.round(clamp(iy - d.offY, 0, ROOM_HEIGHT))
      if (d.kind === 'object') updateObj(d.id, { x: nx, y: ny })
      else setIntPos(d.id, nx, ny)
    }
    const onUp = () => {
      const d = dragRef.current
      if (!d) return
      dragRef.current = null
      if (d.kind === 'object') setPlacements((l) => (savePlacements(l), l))
      else setInteractables((l) => (saveInteractables(l), l))
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startDrag = (e, kind, item) => {
    e.preventDefault()
    setSel({ kind, id: item.id })
    const [ix, iy] = toImage(e.clientX, e.clientY)
    const px = kind === 'object' ? item.x : item.pos[0]
    const py = kind === 'object' ? item.y : item.pos[1]
    dragRef.current = { kind, id: item.id, offX: ix - px, offY: iy - py }
  }

  // Atajos: flechas mueven lo seleccionado; Supr borra objeto; Esc cierra.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (!sel) return
      if (e.key === 'Delete') {
        if (sel.kind === 'object') {
          e.preventDefault()
          removeObject(sel.id)
        }
        return
      }
      const step = e.shiftKey ? 20 : 2
      let dx = 0
      let dy = 0
      if (e.key === 'ArrowLeft') dx = -step
      else if (e.key === 'ArrowRight') dx = step
      else if (e.key === 'ArrowUp') dy = -step
      else if (e.key === 'ArrowDown') dy = step
      else return
      e.preventDefault()
      if (sel.kind === 'object') {
        const o = placements.find((p) => p.id === sel.id)
        if (o) updateObj(o.id, { x: Math.round(o.x + dx), y: Math.round(o.y + dy) })
      } else {
        const it = interactables.find((i) => i.id === sel.id)
        if (it) setIntPos(it.id, Math.round(it.pos[0] + dx), Math.round(it.pos[1] + dy))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sel, placements, interactables, onClose]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Geometria en pantalla para los overlays ---
  const v = getView()
  const sx = (ix) => (v ? v.rect.left + ix * v.scale : 0)
  const sy = (iy) => (v ? v.rect.top + iy * v.scale : 0)
  const polyPoints = (poly) => poly.map(([ix, iy]) => `${sx(ix)},${sy(iy)}`).join(' ')
  const isSel = (kind, id) => sel?.kind === kind && sel.id === id

  return (
    <div className="redit">
      {/* Capa de visualizacion sobre la escena (no captura clics, salvo handles) */}
      <svg className="redit-svg" aria-hidden="true">
        {showFloor && (
          <>
            <polygon className="redit-floor" points={polyPoints(FLOOR)} />
            {WALL_COLLISION.map((band, i) => (
              <polygon key={i} className="redit-wall" points={polyPoints(band)} />
            ))}
          </>
        )}
        {showColliders &&
          v &&
          placements.map((p) => {
            const asset = OBJECT_ASSETS[p.asset]
            // Sin colision (p.ej. portal): no se dibuja caja.
            if (!asset || asset.noCollision || p.solid === false) return null

            // Caja efectiva: imagen completa (fullCollision) o la caja del editor.
            let cx, cy, cw, ch
            if (asset.fullCollision) {
              cw = asset.native.w * p.scale
              ch = asset.native.h * p.scale
              cx = p.x
              cy = p.y - ch / 2
            } else if (p.collision) {
              cw = p.collision.w
              ch = p.collision.h
              cx = p.x + (p.collision.dx || 0)
              cy = p.y + (p.collision.dy || 0)
            } else {
              return null
            }
            const w = cw * v.scale
            const h = ch * v.scale
            return (
              <rect
                key={`c-${p.id}`}
                className={`redit-box${isSel('object', p.id) ? ' is-sel' : ''}`}
                x={sx(cx) - w / 2}
                y={sy(cy) - h / 2}
                width={w}
                height={h}
              />
            )
          })}
        {/* Radio de cada zona interactuable */}
        {showColliders &&
          v &&
          interactables.map((it) => (
            <circle
              key={`ir-${it.id}`}
              className={`redit-range${isSel('interact', it.id) ? ' is-sel' : ''}`}
              cx={sx(it.pos[0])}
              cy={sy(it.pos[1])}
              r={it.radius * v.scale}
            />
          ))}
      </svg>

      {/* Handles arrastrables: objetos */}
      {v &&
        placements.map((p) => (
          <button
            key={`h-${p.id}`}
            type="button"
            className={`redit-handle${isSel('object', p.id) ? ' is-sel' : ''}`}
            style={{ left: sx(p.x), top: sy(p.y) }}
            onPointerDown={(e) => startDrag(e, 'object', p)}
            title={OBJECT_ASSETS[p.asset]?.label || p.asset}
          >
            <span className="redit-handle__dot" />
            <span className="redit-handle__tag">{OBJECT_ASSETS[p.asset]?.label || p.asset}</span>
          </button>
        ))}

      {/* Handles arrastrables: zonas interactuables (E) */}
      {v &&
        interactables.map((it) => (
          <button
            key={`hi-${it.id}`}
            type="button"
            className={`redit-handle redit-handle--int${isSel('interact', it.id) ? ' is-sel' : ''}`}
            style={{ left: sx(it.pos[0]), top: sy(it.pos[1]) }}
            onPointerDown={(e) => startDrag(e, 'interact', it)}
            title={`${it.label} (E)`}
          >
            <span className="redit-handle__dot">E</span>
            <span className="redit-handle__tag">{it.label}</span>
          </button>
        ))}

      {/* Panel de control */}
      <div className="redit-panel">
        <header className="redit-panel__head">
          <strong>Editor</strong>
          <button type="button" className="redit-x" onClick={onClose} aria-label="Cerrar editor">✕</button>
        </header>

        <section className="redit-sec">
          <h4>Añadir objeto</h4>
          <div className="redit-palette">
            {OBJECT_KEYS.map((k) => (
              <button key={k} type="button" className="redit-pal-btn" onClick={() => addObject(k)}>
                <img src={OBJECT_ASSETS[k].src} alt="" />
                <span>{OBJECT_ASSETS[k].label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="redit-sec">
          <h4>Objetos ({placements.length})</h4>
          <div className="redit-list">
            {placements.length === 0 && <p className="redit-empty">Aún no hay objetos. Añade uno arriba.</p>}
            {placements.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`redit-list-item${isSel('object', p.id) ? ' is-sel' : ''}`}
                onClick={() => setSel({ kind: 'object', id: p.id })}
              >
                {OBJECT_ASSETS[p.asset]?.label || p.asset}
              </button>
            ))}
          </div>
        </section>

        {selObj && (
          <section className="redit-sec">
            <h4>{OBJECT_ASSETS[selObj.asset]?.label || selObj.asset}</h4>

            <div className="redit-row">
              <label>X <input type="number" value={Math.round(selObj.x)} onChange={(e) => updateObj(selObj.id, { x: +e.target.value })} /></label>
              <label>Y <input type="number" value={Math.round(selObj.y)} onChange={(e) => updateObj(selObj.id, { y: +e.target.value })} /></label>
            </div>

            <label className="redit-slider">
              Escala {Number(selObj.scale).toFixed(3)}
              <input type="range" min="0.02" max="1.5" step="0.002" value={selObj.scale}
                onChange={(e) => updateObj(selObj.id, { scale: +e.target.value })} />
            </label>

            <label className="redit-check">
              <input type="checkbox" checked={!!selObj.flip} onChange={(e) => updateObj(selObj.id, { flip: e.target.checked })} /> Voltear (espejo)
            </label>
            <label className="redit-check">
              <input type="checkbox" checked={selObj.solid !== false} onChange={(e) => updateObj(selObj.id, { solid: e.target.checked })} /> Sólido (colisiona)
            </label>

            <h5>Colisión (huella)</h5>
            {OBJECT_ASSETS[selObj.asset]?.noCollision ? (
              <p className="redit-empty">Este objeto no colisiona (se puede caminar sobre él).</p>
            ) : OBJECT_ASSETS[selObj.asset]?.fullCollision ? (
              <p className="redit-empty">Colisión automática del tamaño de toda la imagen.</p>
            ) : (
              <>
                <div className="redit-row">
                  <label>Ancho <input type="number" value={Math.round(selObj.collision.w)} onChange={(e) => updateCollision(selObj.id, { w: +e.target.value })} /></label>
                  <label>Alto <input type="number" value={Math.round(selObj.collision.h)} onChange={(e) => updateCollision(selObj.id, { h: +e.target.value })} /></label>
                </div>
                <div className="redit-row">
                  <label>Δx <input type="number" value={Math.round(selObj.collision.dx)} onChange={(e) => updateCollision(selObj.id, { dx: +e.target.value })} /></label>
                  <label>Δy <input type="number" value={Math.round(selObj.collision.dy)} onChange={(e) => updateCollision(selObj.id, { dy: +e.target.value })} /></label>
                </div>
              </>
            )}

            <div className="redit-row">
              <button type="button" className="redit-btn" onClick={() => duplicateObject(selObj.id)}>Duplicar</button>
              <button type="button" className="redit-btn redit-btn--danger" onClick={() => removeObject(selObj.id)}>Borrar</button>
            </div>
          </section>
        )}

        <section className="redit-sec">
          <h4>Zonas interactuables (E)</h4>
          <div className="redit-list">
            {interactables.map((it) => (
              <button
                key={it.id}
                type="button"
                className={`redit-list-item${isSel('interact', it.id) ? ' is-sel' : ''}`}
                onClick={() => setSel({ kind: 'interact', id: it.id })}
              >
                {it.label} · {it.screen}
              </button>
            ))}
          </div>
        </section>

        {selInt && (
          <section className="redit-sec">
            <h4>{selInt.label} (E)</h4>
            <div className="redit-row">
              <label>X <input type="number" value={Math.round(selInt.pos[0])} onChange={(e) => setIntPos(selInt.id, +e.target.value, selInt.pos[1])} /></label>
              <label>Y <input type="number" value={Math.round(selInt.pos[1])} onChange={(e) => setIntPos(selInt.id, selInt.pos[0], +e.target.value)} /></label>
            </div>
            <label className="redit-slider">
              Radio {Math.round(selInt.radius)}
              <input type="range" min="60" max="700" step="5" value={selInt.radius}
                onChange={(e) => updateInt(selInt.id, { radius: +e.target.value })} />
            </label>
          </section>
        )}

        <section className="redit-sec">
          <label className="redit-check"><input type="checkbox" checked={showColliders} onChange={(e) => setShowColliders(e.target.checked)} /> Ver colisiones y radios</label>
          <label className="redit-check"><input type="checkbox" checked={showFloor} onChange={(e) => setShowFloor(e.target.checked)} /> Ver piso/paredes</label>
        </section>

        <section className="redit-sec redit-actions">
          <button type="button" className="redit-btn redit-btn--primary" onClick={save}>Guardar</button>
          <button type="button" className="redit-btn redit-btn--primary" onClick={exportObjects}>Exportar objetos</button>
          <button type="button" className="redit-btn redit-btn--primary" onClick={exportInteractables}>Exportar zonas E</button>
        </section>
        <section className="redit-sec redit-actions">
          <button type="button" className="redit-btn redit-btn--danger" onClick={resetDefaults}>Cargar defaults (descarta lo guardado)</button>
        </section>

        <p className="redit-hint">Arrastra el punto de cada objeto o zona E para moverlo. Flechas = ajuste fino (Shift = más). Supr = borrar objeto. Esc = cerrar.</p>
      </div>

      {toast && <div className="redit-toast">{toast}</div>}
    </div>
  )
}
