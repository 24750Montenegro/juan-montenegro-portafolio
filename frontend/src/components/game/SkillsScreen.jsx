// Zona de conocimientos: tecnologias con logo, detalle y barra de progreso,
// presentadas como las hojas de un libro. Vista publica para todos; alta,
// edicion y borrado solo cuando hay sesion de administrador.
import { useState } from 'react'
import { useSkills } from '../../hooks/useSkills.js'
import { useAuth } from '../../hooks/useAuth.js'
import {
  apiCrearConocimiento, apiActualizarConocimiento, apiEliminarConocimiento,
} from '../../api/skillsApi.js'
import './zones.css'
import './SkillsScreen.css'

const FORM_INICIAL = { nombre: '', categoria: '', descripcion: '', nivel: 50, orden: 0 }

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
  const [imagen, setImagen] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errForm, setErrForm] = useState(null)

  const abrirNuevo = () => { setEditId('nuevo'); setForm(FORM_INICIAL); setImagen(null); setErrForm(null) }
  const abrirEdicion = (c) => {
    setEditId(c.id)
    setForm({
      nombre: c.nombre,
      categoria: c.categoria || '',
      descripcion: c.descripcion || '',
      nivel: c.nivel,
      orden: c.orden,
    })
    setImagen(null)
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
      const datos = new FormData()
      Object.entries(form).forEach(([clave, valor]) => datos.append(clave, valor))
      if (imagen) datos.append('imagen', imagen)
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
    <div className="zone book">
      {autenticado && (
        <div className="zone-admin">
          <span className="zone-admin__tag">ADMIN</span>
          <button type="button" className="zone-btn" onClick={abrirNuevo}>+ NUEVO</button>
        </div>
      )}

      {autenticado && editId !== null && (
        <form className="zone-form" onSubmit={enviar}>
          <label className="zone-field">
            <span>Titulo</span>
            <input className="zone-input" name="nombre" value={form.nombre} onChange={cambiar} required maxLength={80} />
          </label>
          <label className="zone-field">
            <span>Categoria</span>
            <input className="zone-input" name="categoria" value={form.categoria} onChange={cambiar} maxLength={60} placeholder="Frontend, Backend..." />
          </label>
          <label className="zone-field">
            <span>Detalle</span>
            <textarea className="zone-textarea" name="descripcion" value={form.descripcion} onChange={cambiar} rows={3} />
          </label>
          <label className="zone-field">
            <span>Nivel: {form.nivel}%</span>
            <input type="range" name="nivel" min="0" max="100" value={form.nivel} onChange={cambiar} />
          </label>
          <label className="zone-field">
            <span>Orden</span>
            <input className="zone-input" type="number" name="orden" value={form.orden} onChange={cambiar} />
          </label>
          <label className="zone-field">
            <span>Logo (pixelart, opcional)</span>
            <input className="zone-input" type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0] || null)} />
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

      {cargando && <p className="zone-msg">cargando conocimientos...</p>}

      {error && (
        <div className="zone-msg zone-msg--err">
          <p>ERROR: {error}</p>
          <button type="button" className="zone-btn" onClick={recargar}>REINTENTAR</button>
        </div>
      )}

      {!cargando && !error && conocimientos.length === 0 && (
        <p className="zone-msg">Aun no hay conocimientos publicados.</p>
      )}

      {!cargando && !error && agruparPorCategoria(conocimientos).map(([categoria, items]) => (
        <section key={categoria} className="book-chapter">
          <h3 className="book-chapter__title">{categoria}</h3>
          <ul className="book-list">
            {items.map((c) => (
              <li key={c.id} className="book-entry">
                <div className="book-entry__logo">
                  {c.imagen_url
                    ? <img src={c.imagen_url} alt={c.nombre} loading="lazy" />
                    : <span className="book-entry__initial">{c.nombre.charAt(0)}</span>}
                </div>
                <div className="book-entry__main">
                  <div className="book-entry__head">
                    <span className="book-entry__name">{c.nombre}</span>
                    <span className="book-entry__pct">{c.nivel}%</span>
                  </div>
                  {c.descripcion && <p className="book-entry__detail">{c.descripcion}</p>}
                  <div className="book-bar">
                    <div className="book-bar__fill" style={{ width: `${c.nivel}%` }} />
                  </div>
                  {autenticado && (
                    <div className="book-entry__admin">
                      <button type="button" className="zone-btn zone-btn--ghost" onClick={() => abrirEdicion(c)}>EDITAR</button>
                      <button type="button" className="zone-btn zone-btn--danger" onClick={() => eliminar(c.id)}>BORRAR</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
