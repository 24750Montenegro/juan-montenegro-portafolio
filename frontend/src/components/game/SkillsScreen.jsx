// Zona de conocimientos: habilidades con barra de progreso. Vista publica para
// todos; alta, edicion y borrado solo cuando hay sesion de administrador.
import { useState } from 'react'
import { useSkills } from '../../hooks/useSkills.js'
import { useAuth } from '../../hooks/useAuth.js'
import {
  apiCrearConocimiento, apiActualizarConocimiento, apiEliminarConocimiento,
} from '../../api/skillsApi.js'
import './zones.css'
import './SkillsScreen.css'

const FORM_INICIAL = { nombre: '', categoria: '', nivel: 50, orden: 0 }

// Agrupa los conocimientos por categoria conservando el orden de llegada
function agruparPorCategoria(lista) {
  const grupos = new Map()
  for (const c of lista) {
    const clave = c.categoria?.trim() || 'General'
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(c)
  }
  return [...grupos.entries()]
}

export default function SkillsScreen() {
  const { conocimientos, cargando, error, recargar } = useSkills()
  const { autenticado } = useAuth()
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [errForm, setErrForm] = useState(null)

  const abrirNuevo = () => { setEditId('nuevo'); setForm(FORM_INICIAL); setErrForm(null) }
  const abrirEdicion = (c) => {
    setEditId(c.id)
    setForm({ nombre: c.nombre, categoria: c.categoria || '', nivel: c.nivel, orden: c.orden })
    setErrForm(null)
  }
  const cerrar = () => { setEditId(null); setErrForm(null) }
  const cambiar = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const enviar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrForm(null)
    try {
      const datos = {
        nombre: form.nombre,
        categoria: form.categoria,
        nivel: Number(form.nivel),
        orden: Number(form.orden),
      }
      if (editId === 'nuevo') await apiCrearConocimiento(datos)
      else await apiActualizarConocimiento(editId, datos)
      cerrar()
      recargar()
    } catch {
      setErrForm('No se pudo guardar el conocimiento')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('Eliminar este conocimiento?')) return
    await apiEliminarConocimiento(id)
    recargar()
  }

  return (
    <div className="zone">
      {autenticado && (
        <div className="zone-admin">
          <span className="zone-admin__tag">ADMIN</span>
          <button type="button" className="zone-btn" onClick={abrirNuevo}>+ NUEVO</button>
        </div>
      )}

      {autenticado && editId !== null && (
        <form className="zone-form" onSubmit={enviar}>
          <label className="zone-field">
            <span>Nombre</span>
            <input className="zone-input" name="nombre" value={form.nombre} onChange={cambiar} required maxLength={80} />
          </label>
          <label className="zone-field">
            <span>Categoria</span>
            <input className="zone-input" name="categoria" value={form.categoria} onChange={cambiar} maxLength={60} placeholder="Frontend, Backend..." />
          </label>
          <label className="zone-field">
            <span>Nivel: {form.nivel}%</span>
            <input type="range" name="nivel" min="0" max="100" value={form.nivel} onChange={cambiar} />
          </label>
          <label className="zone-field">
            <span>Orden</span>
            <input className="zone-input" type="number" name="orden" value={form.orden} onChange={cambiar} />
          </label>
          {errForm && <p className="zone-error">{errForm}</p>}
          <div className="zone-form__actions">
            <button type="submit" className="zone-btn" disabled={guardando}>
              {guardando ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
            <button type="button" className="zone-btn zone-btn--ghost" onClick={cerrar}>CANCELAR</button>
          </div>
        </form>
      )}

      {cargando && <p className="zone-msg">&gt; cargando conocimientos<span className="zone-caret">_</span></p>}

      {error && (
        <div className="zone-msg zone-msg--err">
          <p>&gt; ERROR: {error}</p>
          <button type="button" className="zone-btn" onClick={recargar}>REINTENTAR</button>
        </div>
      )}

      {!cargando && !error && conocimientos.length === 0 && (
        <p className="zone-msg">&gt; aun no hay conocimientos publicados.</p>
      )}

      {!cargando && !error && agruparPorCategoria(conocimientos).map(([categoria, items]) => (
        <section key={categoria} className="skills-group">
          <h3 className="skills-group__title">{categoria}</h3>
          <ul className="skills-list">
            {items.map((c) => (
              <li key={c.id} className="skill">
                <div className="skill__head">
                  <span className="skill__name">{c.nombre}</span>
                  <span className="skill__pct">{c.nivel}%</span>
                </div>
                <div className="skill__bar">
                  <div className="skill__fill" style={{ width: `${c.nivel}%` }} />
                </div>
                {autenticado && (
                  <div className="skill__admin">
                    <button type="button" className="zone-btn zone-btn--ghost" onClick={() => abrirEdicion(c)}>EDITAR</button>
                    <button type="button" className="zone-btn zone-btn--danger" onClick={() => eliminar(c.id)}>BORRAR</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
