// Contenido del monitor: lista de proyectos del portafolio (desde el backend),
// con estetica retro/pixelart. Las tarjetas se expanden con un clic (imagen
// arriba, texto abajo y botones grandes de recursos). Incluye login de
// administrador para gestionar los CRUD (solo el dueno) y enlaces adicionales
// por proyecto (p. ej. repos separados de frontend/backend).
import { useState } from 'react'
import { useProjects } from '../../hooks/useProjects.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import {
  apiCrearProyecto, apiActualizarProyecto, apiEliminarProyecto,
} from '../../api/projectsApi.js'
import { optimizarImagen } from '../../utils/cloudinary.js'
import githubIcon from '../../assets/github.webp'
import linkIcon from '../../assets/link.webp'
import './zones.css'
import './ProjectsScreen.css'

const FORM_INICIAL = {
  titulo: '', descripcion: '', repoUrl: '', demoUrl: '', etiquetas: '', destacado: false, orden: 0, enlaces: [],
}

export default function ProjectsScreen() {
  const { proyectos, cargando, error, recargar } = useProjects()
  const { autenticado, login, logout } = useAuth()
  const { t } = useLanguage()

  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [credenciales, setCredenciales] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState(null)
  const [entrando, setEntrando] = useState(false)

  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [imagen, setImagen] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errForm, setErrForm] = useState(null)

  // Tarjeta expandida (solo una a la vez)
  const [abiertaId, setAbiertaId] = useState(null)
  const alternarTarjeta = (id) => setAbiertaId((prev) => (prev === id ? null : id))

  const cambiarCred = (e) => {
    const { name, value } = e.target
    setCredenciales((p) => ({ ...p, [name]: value }))
  }

  const enviarLogin = async (e) => {
    e.preventDefault()
    setEntrando(true)
    setLoginError(null)
    try {
      await login(credenciales)
      setMostrarLogin(false)
      setCredenciales({ email: '', password: '' })
    } catch {
      setLoginError(t('projectsScreen.loginInvalid'))
    } finally {
      setEntrando(false)
    }
  }

  const abrirNuevo = () => { setEditId('nuevo'); setForm(FORM_INICIAL); setImagen(null); setErrForm(null) }
  const abrirEdicion = (p) => {
    setEditId(p.id)
    setForm({
      titulo: p.titulo,
      descripcion: p.descripcion,
      repoUrl: p.repo_url || '',
      demoUrl: p.demo_url || '',
      etiquetas: (p.etiquetas || []).join(', '),
      destacado: p.destacado,
      orden: p.orden,
      enlaces: Array.isArray(p.enlaces) ? p.enlaces.map((en) => ({ ...en })) : [],
    })
    setImagen(null)
    setErrForm(null)
  }
  const cerrar = () => { setEditId(null); setErrForm(null) }
  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  // Editor de enlaces adicionales del formulario
  const agregarEnlace = () =>
    setForm((p) => ({ ...p, enlaces: [...p.enlaces, { etiqueta: '', url: '' }] }))
  const cambiarEnlace = (i, campo, valor) =>
    setForm((p) => ({
      ...p,
      enlaces: p.enlaces.map((en, j) => (j === i ? { ...en, [campo]: valor } : en)),
    }))
  const quitarEnlace = (i) =>
    setForm((p) => ({ ...p, enlaces: p.enlaces.filter((_, j) => j !== i) }))

  const enviar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrForm(null)
    try {
      const datos = new FormData()
      datos.append('titulo', form.titulo)
      datos.append('descripcion', form.descripcion)
      datos.append('repoUrl', form.repoUrl)
      datos.append('demoUrl', form.demoUrl)
      datos.append('etiquetas', form.etiquetas)
      datos.append('enlaces', JSON.stringify(form.enlaces.filter((en) => en.url.trim())))
      // coerce.boolean trata cualquier texto no vacio como true
      datos.append('destacado', form.destacado ? 'true' : '')
      datos.append('orden', form.orden)
      if (imagen) datos.append('imagen', imagen)
      if (editId === 'nuevo') await apiCrearProyecto(datos)
      else await apiActualizarProyecto(editId, datos)
      cerrar()
      recargar()
    } catch {
      setErrForm(t('projectsScreen.saveError'))
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm(t('projectsScreen.deleteConfirm'))) return
    await apiEliminarProyecto(id)
    recargar()
  }

  return (
    <div className="pscreen">
      <header className="pscreen__bar">
        <span className="pscreen__dot" />
        <span className="pscreen__title">PROYECTOS.EXE</span>
        <span className="pscreen__user">~/juan-montenegro</span>
        {autenticado ? (
          <button type="button" className="pscreen__admin" onClick={logout}>{t('projectsScreen.exit')}</button>
        ) : (
          <button type="button" className="pscreen__admin" onClick={() => setMostrarLogin((s) => !s)}>{t('common.admin')}</button>
        )}
      </header>

      <div className="pscreen__body">
        {!autenticado && mostrarLogin && (
          <form className="zone-form pscreen__login" onSubmit={enviarLogin}>
            <p className="pscreen__login-lead">{t('projectsScreen.adminAccess')}</p>
            <label className="zone-field">
              <span>{t('projectsScreen.email')}</span>
              <input className="zone-input" type="email" name="email" value={credenciales.email} onChange={cambiarCred} required autoComplete="email" />
            </label>
            <label className="zone-field">
              <span>{t('projectsScreen.password')}</span>
              <input className="zone-input" type="password" name="password" value={credenciales.password} onChange={cambiarCred} required minLength={8} autoComplete="current-password" />
            </label>
            {loginError && <p className="zone-error">{loginError}</p>}
            <div className="zone-form__actions">
              <button type="submit" className="zone-btn" disabled={entrando}>{entrando ? t('projectsScreen.entering') : t('projectsScreen.enter')}</button>
              <button type="button" className="zone-btn zone-btn--ghost" onClick={() => setMostrarLogin(false)}>{t('common.cancel')}</button>
            </div>
          </form>
        )}

        {autenticado && (
          <div className="zone-admin">
            <span className="zone-admin__tag">{t('common.admin')}</span>
            <button type="button" className="zone-btn" onClick={abrirNuevo}>{t('common.new')}</button>
          </div>
        )}

        {autenticado && editId !== null && (
          <form className="zone-form" onSubmit={enviar}>
            <label className="zone-field">
              <span>{t('projectsScreen.title')}</span>
              <input className="zone-input" name="titulo" value={form.titulo} onChange={cambiar} required maxLength={120} />
            </label>
            <label className="zone-field">
              <span>{t('projectsScreen.description')}</span>
              <textarea className="zone-textarea" name="descripcion" value={form.descripcion} onChange={cambiar} required rows={3} />
            </label>
            <label className="zone-field">
              <span>{t('projectsScreen.githubLink')}</span>
              <input className="zone-input" name="repoUrl" type="url" value={form.repoUrl} onChange={cambiar} placeholder="https://github.com/..." />
            </label>
            <label className="zone-field">
              <span>{t('projectsScreen.demoLink')}</span>
              <input className="zone-input" name="demoUrl" type="url" value={form.demoUrl} onChange={cambiar} placeholder="https://..." />
            </label>

            <fieldset className="pscreen__links">
              <legend>{t('projectsScreen.links')}</legend>
              {form.enlaces.map((en, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={i} className="pscreen__link-row">
                  <input
                    className="zone-input"
                    value={en.etiqueta}
                    maxLength={40}
                    placeholder={t('projectsScreen.linkLabelPlaceholder')}
                    aria-label={t('projectsScreen.linkLabel')}
                    onChange={(e) => cambiarEnlace(i, 'etiqueta', e.target.value)}
                  />
                  <input
                    className="zone-input"
                    type="url"
                    value={en.url}
                    placeholder="https://..."
                    aria-label={t('projectsScreen.linkUrl')}
                    onChange={(e) => cambiarEnlace(i, 'url', e.target.value)}
                  />
                  <button
                    type="button"
                    className="zone-btn zone-btn--danger pscreen__link-del"
                    aria-label={t('projectsScreen.removeLink')}
                    onClick={() => quitarEnlace(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="zone-btn zone-btn--ghost" onClick={agregarEnlace}>
                {t('projectsScreen.addLink')}
              </button>
            </fieldset>

            <label className="zone-field">
              <span>{t('projectsScreen.tags')}</span>
              <input className="zone-input" name="etiquetas" value={form.etiquetas} onChange={cambiar} />
            </label>
            <label className="zone-field">
              <span>{t('projectsScreen.order')}</span>
              <input className="zone-input" type="number" name="orden" value={form.orden} onChange={cambiar} />
            </label>
            <label className="pscreen__check">
              <input type="checkbox" name="destacado" checked={form.destacado} onChange={cambiar} /> {t('projectsScreen.featured')}
            </label>
            <label className="zone-field">
              <span>{t('projectsScreen.image')}</span>
              <input className="zone-input" type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0] || null)} />
            </label>
            {errForm && <p className="zone-error">{errForm}</p>}
            <div className="zone-form__actions">
              <button type="submit" className="zone-btn" disabled={guardando}>{guardando ? t('common.saving') : t('common.save')}</button>
              <button type="button" className="zone-btn zone-btn--ghost" onClick={cerrar}>{t('common.cancel')}</button>
            </div>
          </form>
        )}

        {cargando && <p className="pscreen__msg">{t('projectsScreen.loading')}<span className="pscreen__caret">_</span></p>}

        {error && (
          <div className="pscreen__msg pscreen__msg--err">
            <p>&gt; ERROR: {error}</p>
            <button type="button" className="pscreen__btn" onClick={recargar}>
              {t('common.retry')}
            </button>
          </div>
        )}

        {!cargando && !error && proyectos.length === 0 && (
          <p className="pscreen__msg">{t('projectsScreen.empty')}</p>
        )}

        {!cargando && !error && proyectos.length > 0 && (
          <ul className="pscreen__list">
            {proyectos.map((p) => {
              const abierta = abiertaId === p.id
              const extra = Array.isArray(p.enlaces) ? p.enlaces : []
              return (
                <li
                  key={p.id}
                  className={`pscreen__card${abierta ? ' pscreen__card--open' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={abierta}
                  title={abierta ? t('projectsScreen.collapseHint') : t('projectsScreen.expandHint')}
                  onClick={(e) => {
                    // Los enlaces y botones internos no alternan la tarjeta
                    if (e.target.closest('a, button, input, textarea')) return
                    alternarTarjeta(p.id)
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
                      e.preventDefault()
                      alternarTarjeta(p.id)
                    }
                  }}
                >
                  {p.imagen_url && (
                    <img
                      className={abierta ? 'pscreen__hero' : 'pscreen__thumb'}
                      src={optimizarImagen(p.imagen_url, abierta ? 900 : 320)}
                      alt={p.titulo}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="pscreen__info">
                    <h3 className="pscreen__name">
                      {p.destacado && <span className="pscreen__star">★</span>}
                      {p.titulo}
                      <span className="pscreen__chevron" aria-hidden="true">{abierta ? '▼' : '▶'}</span>
                    </h3>
                    {p.descripcion && (
                      <p className={`pscreen__desc${abierta ? '' : ' pscreen__desc--clamp'}`}>{p.descripcion}</p>
                    )}
                    {p.etiquetas?.length > 0 && (
                      <ul className="pscreen__tags">
                        {p.etiquetas.map((tag) => (
                          <li key={tag} className="pscreen__tag">{tag}</li>
                        ))}
                      </ul>
                    )}

                    {abierta ? (
                      <div className="pscreen__resources">
                        {p.repo_url && (
                          <a className="pscreen__res-btn" href={p.repo_url} target="_blank" rel="noopener noreferrer">
                            <img src={githubIcon} alt="" aria-hidden="true" />
                            GITHUB
                          </a>
                        )}
                        {p.demo_url && (
                          <a className="pscreen__res-btn" href={p.demo_url} target="_blank" rel="noopener noreferrer">
                            <img src={linkIcon} alt="" aria-hidden="true" />
                            DEMO
                          </a>
                        )}
                        {extra.map((en) => (
                          <a key={en.url} className="pscreen__res-btn" href={en.url} target="_blank" rel="noopener noreferrer">
                            <img src={linkIcon} alt="" aria-hidden="true" />
                            {(en.etiqueta || t('projectsScreen.visit')).toUpperCase()}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="pscreen__actions">
                        {p.repo_url && (
                          <a href={p.repo_url} target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">
                            <img className="pscreen__icon" src={githubIcon} alt="GitHub" />
                          </a>
                        )}
                        {p.demo_url && (
                          <a href={p.demo_url} target="_blank" rel="noopener noreferrer" title={t('projectsScreen.link')} aria-label={t('projectsScreen.link')}>
                            <img className="pscreen__icon" src={linkIcon} alt={t('projectsScreen.link')} />
                          </a>
                        )}
                        {extra.length > 0 && (
                          <span className="pscreen__more" title={t('projectsScreen.links')}>+{extra.length}</span>
                        )}
                      </div>
                    )}

                    {autenticado && (
                      <div className="pscreen__card-admin">
                        <button type="button" className="zone-btn zone-btn--ghost" onClick={() => abrirEdicion(p)}>{t('common.edit')}</button>
                        <button type="button" className="zone-btn zone-btn--danger" onClick={() => eliminar(p.id)}>{t('common.delete')}</button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="pscreen__scanlines" aria-hidden="true" />
    </div>
  )
}
