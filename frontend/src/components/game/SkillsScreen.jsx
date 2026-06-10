// Zona de conocimientos: tecnologias con logo, detalle y barra de progreso,
// presentadas como las hojas de un libro. Vista publica para todos; alta,
// edicion y borrado solo cuando hay sesion de administrador.
import { useState } from 'react'
import { useSkills } from '../../hooks/useSkills.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import {
  apiCrearConocimiento, apiActualizarConocimiento, apiEliminarConocimiento,
} from '../../api/skillsApi.js'
import { optimizarImagen } from '../../utils/cloudinary.js'
import './zones.css'
import './SkillsScreen.css'

const FORM_INICIAL = { nombre: '', categoria: '', descripcion: '', nivel: 50, orden: 0 }

// Agrupa los conocimientos por categoria conservando el orden de llegada
function agruparPorCategoria(lista, generalLabel) {
  const grupos = new Map()
  for (const c of lista) {
    const clave = c.categoria?.trim() || generalLabel
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(c)
  }
  return [...grupos.entries()]
}

export default function SkillsScreen() {
  const { conocimientos, cargando, error, recargar } = useSkills()
  const { autenticado } = useAuth()
  const { t } = useLanguage()
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
      setErrForm(t('skills.saveError'))
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm(t('skills.deleteConfirm'))) return
    await apiEliminarConocimiento(id)
    recargar()
  }

  return (
    <div className="zone book">
      {autenticado && (
        <div className="zone-admin">
          <span className="zone-admin__tag">{t('common.admin')}</span>
          <button type="button" className="zone-btn" onClick={abrirNuevo}>{t('common.new')}</button>
        </div>
      )}

      {autenticado && editId !== null && (
        <form className="zone-form" onSubmit={enviar}>
          <label className="zone-field">
            <span>{t('skills.title')}</span>
            <input className="zone-input" name="nombre" value={form.nombre} onChange={cambiar} required maxLength={80} />
          </label>
          <label className="zone-field">
            <span>{t('skills.category')}</span>
            <input className="zone-input" name="categoria" value={form.categoria} onChange={cambiar} maxLength={60} placeholder={t('skills.categoryPlaceholder')} />
          </label>
          <label className="zone-field">
            <span>{t('skills.detail')}</span>
            <textarea className="zone-textarea" name="descripcion" value={form.descripcion} onChange={cambiar} rows={3} />
          </label>
          <label className="zone-field">
            <span>{t('skills.level')}: {form.nivel}%</span>
            <input type="range" name="nivel" min="0" max="100" value={form.nivel} onChange={cambiar} />
          </label>
          <label className="zone-field">
            <span>{t('skills.order')}</span>
            <input className="zone-input" type="number" name="orden" value={form.orden} onChange={cambiar} />
          </label>
          <label className="zone-field">
            <span>{t('skills.logo')}</span>
            <input className="zone-input" type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0] || null)} />
          </label>
          {errForm && <p className="zone-error">{errForm}</p>}
          <div className="zone-form__actions">
            <button type="submit" className="zone-btn" disabled={guardando}>
              {guardando ? t('common.saving') : t('common.save')}
            </button>
            <button type="button" className="zone-btn zone-btn--ghost" onClick={cerrar}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {cargando && <p className="zone-msg">{t('skills.loading')}</p>}

      {error && (
        <div className="zone-msg zone-msg--err">
          <p>ERROR: {error}</p>
          <button type="button" className="zone-btn" onClick={recargar}>{t('common.retry')}</button>
        </div>
      )}

      {!cargando && !error && conocimientos.length === 0 && (
        <p className="zone-msg">{t('skills.empty')}</p>
      )}

      {!cargando && !error && agruparPorCategoria(conocimientos, t('skills.generalCategory')).map(([categoria, items]) => (
        <section key={categoria} className="book-chapter">
          <h3 className="book-chapter__title">{categoria}</h3>
          <ul className="book-list">
            {items.map((c) => (
              <li key={c.id} className="book-entry">
                <div className="book-entry__logo">
                  {c.imagen_url
                    ? <img src={optimizarImagen(c.imagen_url, 128)} alt={c.nombre} loading="lazy" decoding="async" />
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
                      <button type="button" className="zone-btn zone-btn--ghost" onClick={() => abrirEdicion(c)}>{t('common.edit')}</button>
                      <button type="button" className="zone-btn zone-btn--danger" onClick={() => eliminar(c.id)}>{t('common.delete')}</button>
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
