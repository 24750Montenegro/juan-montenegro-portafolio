// Zona de logros: tarjetas con imagen opcional. Vista publica para todos; alta,
// edicion y borrado solo cuando hay sesion de administrador.
import { useState } from 'react'
import { useAchievements } from '../../hooks/useAchievements.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import {
  apiCrearLogro, apiActualizarLogro, apiEliminarLogro,
} from '../../api/achievementsApi.js'
import { optimizarImagen } from '../../utils/cloudinary.js'
import './zones.css'
import './AchievementsScreen.css'

const FORM_INICIAL = { titulo: '', descripcion: '', fecha: '', orden: 0 }

export default function AchievementsScreen() {
  const { logros, cargando, error, recargar } = useAchievements()
  const { autenticado } = useAuth()
  const { t } = useLanguage()
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
      setErrForm(t('achievements.saveError'))
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm(t('achievements.deleteConfirm'))) return
    await apiEliminarLogro(id)
    recargar()
  }

  return (
    <div className="zone medal">
      {autenticado && (
        <div className="zone-admin">
          <span className="zone-admin__tag">{t('common.admin')}</span>
          <button type="button" className="zone-btn" onClick={abrirNuevo}>{t('common.new')}</button>
        </div>
      )}

      {autenticado && editId !== null && (
        <form className="zone-form" onSubmit={enviar}>
          <label className="zone-field">
            <span>{t('achievements.title')}</span>
            <input className="zone-input" name="titulo" value={form.titulo} onChange={cambiar} required maxLength={120} />
          </label>
          <label className="zone-field">
            <span>{t('achievements.description')}</span>
            <textarea className="zone-textarea" name="descripcion" value={form.descripcion} onChange={cambiar} rows={3} />
          </label>
          <label className="zone-field">
            <span>{t('achievements.date')}</span>
            <input className="zone-input" name="fecha" value={form.fecha} onChange={cambiar} maxLength={40} placeholder={t('achievements.datePlaceholder')} />
          </label>
          <label className="zone-field">
            <span>{t('achievements.order')}</span>
            <input className="zone-input" type="number" name="orden" value={form.orden} onChange={cambiar} />
          </label>
          <label className="zone-field">
            <span>{t('achievements.image')}</span>
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

      {cargando && <p className="zone-msg">{t('achievements.loading')}</p>}

      {error && (
        <div className="zone-msg zone-msg--err">
          <p>ERROR: {error}</p>
          <button type="button" className="zone-btn" onClick={recargar}>{t('common.retry')}</button>
        </div>
      )}

      {!cargando && !error && logros.length === 0 && (
        <p className="zone-msg">{t('achievements.empty')}</p>
      )}

      {!cargando && !error && logros.length > 0 && (
        <ul className="ach-list">
          {logros.map((l) => (
            <li key={l.id} className="ach-card">
              {l.imagen_url && (
                <img className="ach-card__img" src={optimizarImagen(l.imagen_url, 480)} alt={l.titulo} loading="lazy" decoding="async" />
              )}
              <div className="ach-card__body">
                <h3 className="ach-card__title">{l.titulo}</h3>
                {l.fecha && <span className="ach-card__date">{l.fecha}</span>}
                {l.descripcion && <p className="ach-card__desc">{l.descripcion}</p>}
                {autenticado && (
                  <div className="ach-card__admin">
                    <button type="button" className="zone-btn zone-btn--ghost" onClick={() => abrirEdicion(l)}>{t('common.edit')}</button>
                    <button type="button" className="zone-btn zone-btn--danger" onClick={() => eliminar(l.id)}>{t('common.delete')}</button>
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
