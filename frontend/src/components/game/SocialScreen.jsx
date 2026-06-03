// Zona social con dos pestanas: Resenas (los visitantes dejan calificacion y
// comentario, visibles de inmediato; el admin puede borrar) y Contacto (PDF del
// portafolio e iconos de contacto).
import { useState } from 'react'
import { useReviews } from '../../hooks/useReviews.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import { apiCrearResena, apiEliminarResena } from '../../api/reviewsApi.js'
import ContactTab from './ContactTab.jsx'
import './zones.css'
import './SocialScreen.css'

const FORM_INICIAL = { nombre: '', comentario: '' }

// Formatea la fecha del registro a algo corto y legible, en el locale dado
function formatearFecha(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export default function SocialScreen() {
  const { resenas, cargando, error, recargar } = useReviews()
  const { autenticado } = useAuth()
  const { t } = useLanguage()
  const [tab, setTab] = useState('contacto')
  const [form, setForm] = useState(FORM_INICIAL)
  const [calificacion, setCalificacion] = useState(5)
  const [enviando, setEnviando] = useState(false)
  const [errForm, setErrForm] = useState(null)
  const [exito, setExito] = useState(false)

  const cambiar = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setErrForm(null)
    setExito(false)
    try {
      await apiCrearResena({ ...form, calificacion })
      setForm(FORM_INICIAL)
      setCalificacion(5)
      setExito(true)
      recargar()
    } catch {
      setErrForm(t('social.sendError'))
    } finally {
      setEnviando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm(t('social.deleteConfirm'))) return
    await apiEliminarResena(id)
    recargar()
  }

  return (
    <div className="zone">
      <div className="social-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'contacto'}
          className={`social-tab${tab === 'contacto' ? ' is-active' : ''}`}
          onClick={() => setTab('contacto')}
        >
          {t('social.tabContact')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'resenas'}
          className={`social-tab${tab === 'resenas' ? ' is-active' : ''}`}
          onClick={() => setTab('resenas')}
        >
          {t('social.tabReviews')}
        </button>
      </div>

      {tab === 'contacto' ? (
        <ContactTab />
      ) : (
        <>
          <form className="zone-form social-form" onSubmit={enviar}>
            <p className="social-form__lead">{t('social.formLead')}</p>
            <label className="zone-field">
              <span>{t('social.name')}</span>
              <input className="zone-input" name="nombre" value={form.nombre} onChange={cambiar} required maxLength={80} />
            </label>
            <div className="zone-field">
              <span>{t('social.rating')}</span>
              <div className="social-stars" role="radiogroup" aria-label={t('social.rating')}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`social-star${n <= calificacion ? ' is-on' : ''}`}
                    onClick={() => setCalificacion(n)}
                    aria-label={`${n} ${t('social.starLabel')}`}
                    aria-pressed={n === calificacion}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <label className="zone-field">
              <span>{t('social.comment')}</span>
              <textarea className="zone-textarea" name="comentario" value={form.comentario} onChange={cambiar} required rows={3} maxLength={1000} />
            </label>
            {errForm && <p className="zone-error">{errForm}</p>}
            {exito && <p className="social-ok">{t('social.success')}</p>}
            <div className="zone-form__actions">
              <button type="submit" className="zone-btn" disabled={enviando}>
                {enviando ? t('social.sending') : t('social.send')}
              </button>
            </div>
          </form>

          {cargando && <p className="zone-msg">{t('social.loading')}<span className="zone-caret">_</span></p>}

          {error && (
            <div className="zone-msg zone-msg--err">
              <p>&gt; ERROR: {error}</p>
              <button type="button" className="zone-btn" onClick={recargar}>{t('common.retry')}</button>
            </div>
          )}

          {!cargando && !error && resenas.length === 0 && (
            <p className="zone-msg">{t('social.empty')}</p>
          )}

          {!cargando && !error && resenas.length > 0 && (
            <ul className="social-list">
              {resenas.map((r) => (
                <li key={r.id} className="social-card">
                  <div className="social-card__head">
                    <span className="social-card__name">{r.nombre}</span>
                    <span className="social-card__stars" aria-label={`${r.calificacion} ${t('social.of')} 5`}>
                      {'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}
                    </span>
                  </div>
                  <p className="social-card__text">{r.comentario}</p>
                  <div className="social-card__foot">
                    <span className="social-card__date">{formatearFecha(r.creado_en, t('social.locale'))}</span>
                    {autenticado && (
                      <button type="button" className="zone-btn zone-btn--danger" onClick={() => eliminar(r.id)}>{t('common.delete')}</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
