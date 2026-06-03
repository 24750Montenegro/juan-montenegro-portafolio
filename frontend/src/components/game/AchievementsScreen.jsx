// Zona de logros: tarjetas con imagen opcional. Vista publica para todos; alta,
// edicion y borrado solo cuando hay sesion de administrador.
import { useState } from 'react'
import { useAchievements } from '../../hooks/useAchievements.js'
import { useAuth } from '../../hooks/useAuth.js'
import {
  apiCrearLogro, apiActualizarLogro, apiEliminarLogro,
} from '../../api/achievementsApi.js'
import './zones.css'
import './AchievementsScreen.css'

const FORM_INICIAL = { titulo: '', descripcion: '', fecha: '', orden: 0 }

export default function AchievementsScreen() {
  const { logros, cargando, error, recargar } = useAchievements()
  const { autenticado } = useAuth()
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [imagen, setImagen] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errForm, setErrForm] = useState(null)

  const abrirNuevo = () => { setEditId('nuevo'); setForm(FORM_INICIAL); setImagen(null); setErrForm(null) }
  const abrirEdicion = (l) => {
    setEditId(l.id)
    setForm({ titulo: l.titulo, descripcion: l.descripcion || '', fecha: l.fecha || '', orden: l.orden })
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
      if (editId === 'nuevo') await apiCrearLogro(datos)
      else await apiActualizarLogro(editId, datos)
      cerrar()
      recargar()
    } catch {
      setErrForm('No se pudo guardar el logro')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('Eliminar este logro?')) return
    await apiEliminarLogro(id)
    recargar()
  }

  return (
    <div className="zone diploma">
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
            <input className="zone-input" name="titulo" value={form.titulo} onChange={cambiar} required maxLength={120} />
          </label>
          <label className="zone-field">
            <span>Descripcion</span>
            <textarea className="zone-textarea" name="descripcion" value={form.descripcion} onChange={cambiar} rows={3} />
          </label>
          <label className="zone-field">
            <span>Fecha</span>
            <input className="zone-input" name="fecha" value={form.fecha} onChange={cambiar} maxLength={40} placeholder="2024, Marzo 2024..." />
          </label>
          <label className="zone-field">
            <span>Orden</span>
            <input className="zone-input" type="number" name="orden" value={form.orden} onChange={cambiar} />
          </label>
          <label className="zone-field">
            <span>Imagen (opcional)</span>
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

      {cargando && <p className="zone-msg">cargando logros...</p>}

      {error && (
        <div className="zone-msg zone-msg--err">
          <p>ERROR: {error}</p>
          <button type="button" className="zone-btn" onClick={recargar}>REINTENTAR</button>
        </div>
      )}

      {!cargando && !error && logros.length === 0 && (
        <p className="zone-msg">Aun no hay logros publicados.</p>
      )}

      {!cargando && !error && logros.length > 0 && (
        <ul className="ach-list">
          {logros.map((l) => (
            <li key={l.id} className="ach-card">
              {l.imagen_url && (
                <img className="ach-card__img" src={l.imagen_url} alt={l.titulo} loading="lazy" />
              )}
              <div className="ach-card__body">
                <h3 className="ach-card__title">{l.titulo}</h3>
                {l.fecha && <span className="ach-card__date">{l.fecha}</span>}
                {l.descripcion && <p className="ach-card__desc">{l.descripcion}</p>}
                {autenticado && (
                  <div className="ach-card__admin">
                    <button type="button" className="zone-btn zone-btn--ghost" onClick={() => abrirEdicion(l)}>EDITAR</button>
                    <button type="button" className="zone-btn zone-btn--danger" onClick={() => eliminar(l.id)}>BORRAR</button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
