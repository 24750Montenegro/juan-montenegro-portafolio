// Contenido del monitor: lista de proyectos del portafolio (desde el backend),
// con estetica retro/pixelart. Incluye login de administrador para gestionar
// los CRUD (solo el dueno) e iconos de github/enlace por proyecto.
import { useState } from 'react'
import { useProjects } from '../../hooks/useProjects.js'
import { useAuth } from '../../hooks/useAuth.js'
import {
  apiCrearProyecto, apiActualizarProyecto, apiEliminarProyecto,
} from '../../api/projectsApi.js'
import githubIcon from '../../assets/github.png'
import linkIcon from '../../assets/link.png'
import './zones.css'
import './ProjectsScreen.css'

const FORM_INICIAL = {
  titulo: '', descripcion: '', repoUrl: '', demoUrl: '', etiquetas: '', destacado: false, orden: 0,
}

export default function ProjectsScreen() {
  const { proyectos, cargando, error, recargar } = useProjects()
  const { autenticado, login, logout } = useAuth()

  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [credenciales, setCredenciales] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState(null)
  const [entrando, setEntrando] = useState(false)

  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [imagen, setImagen] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errForm, setErrForm] = useState(null)

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
      setLoginError('Credenciales invalidas')
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
    })
    setImagen(null)
    setErrForm(null)
  }
  const cerrar = () => { setEditId(null); setErrForm(null) }
  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

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
      // coerce.boolean trata cualquier texto no vacio como true
      datos.append('destacado', form.destacado ? 'true' : '')
      datos.append('orden', form.orden)
      if (imagen) datos.append('imagen', imagen)
      if (editId === 'nuevo') await apiCrearProyecto(datos)
      else await apiActualizarProyecto(editId, datos)
      cerrar()
      recargar()
    } catch {
      setErrForm('No se pudo guardar el proyecto')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('Eliminar este proyecto?')) return
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
          <button type="button" className="pscreen__admin" onClick={logout}>SALIR</button>
        ) : (
          <button type="button" className="pscreen__admin" onClick={() => setMostrarLogin((s) => !s)}>ADMIN</button>
        )}
      </header>

      <div className="pscreen__body">
        {!autenticado && mostrarLogin && (
          <form className="zone-form pscreen__login" onSubmit={enviarLogin}>
            <p className="pscreen__login-lead">&gt; acceso de administrador</p>
            <label className="zone-field">
              <span>Email</span>
              <input className="zone-input" type="email" name="email" value={credenciales.email} onChange={cambiarCred} required autoComplete="email" />
            </label>
            <label className="zone-field">
              <span>Contrasena</span>
              <input className="zone-input" type="password" name="password" value={credenciales.password} onChange={cambiarCred} required minLength={8} autoComplete="current-password" />
            </label>
            {loginError && <p className="zone-error">{loginError}</p>}
            <div className="zone-form__actions">
              <button type="submit" className="zone-btn" disabled={entrando}>{entrando ? 'ENTRANDO...' : 'ENTRAR'}</button>
              <button type="button" className="zone-btn zone-btn--ghost" onClick={() => setMostrarLogin(false)}>CANCELAR</button>
            </div>
          </form>
        )}

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
              <textarea className="zone-textarea" name="descripcion" value={form.descripcion} onChange={cambiar} required rows={3} />
            </label>
            <label className="zone-field">
              <span>Enlace a GitHub</span>
              <input className="zone-input" name="repoUrl" type="url" value={form.repoUrl} onChange={cambiar} placeholder="https://github.com/..." />
            </label>
            <label className="zone-field">
              <span>Enlace a la pagina/demo</span>
              <input className="zone-input" name="demoUrl" type="url" value={form.demoUrl} onChange={cambiar} placeholder="https://..." />
            </label>
            <label className="zone-field">
              <span>Etiquetas (separadas por coma)</span>
              <input className="zone-input" name="etiquetas" value={form.etiquetas} onChange={cambiar} />
            </label>
            <label className="zone-field">
              <span>Orden</span>
              <input className="zone-input" type="number" name="orden" value={form.orden} onChange={cambiar} />
            </label>
            <label className="pscreen__check">
              <input type="checkbox" name="destacado" checked={form.destacado} onChange={cambiar} /> Destacado
            </label>
            <label className="zone-field">
              <span>Imagen</span>
              <input className="zone-input" type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0] || null)} />
            </label>
            {errForm && <p className="zone-error">{errForm}</p>}
            <div className="zone-form__actions">
              <button type="submit" className="zone-btn" disabled={guardando}>{guardando ? 'GUARDANDO...' : 'GUARDAR'}</button>
              <button type="button" className="zone-btn zone-btn--ghost" onClick={cerrar}>CANCELAR</button>
            </div>
          </form>
        )}

        {cargando && <p className="pscreen__msg">&gt; cargando proyectos<span className="pscreen__caret">_</span></p>}

        {error && (
          <div className="pscreen__msg pscreen__msg--err">
            <p>&gt; ERROR: {error}</p>
            <button type="button" className="pscreen__btn" onClick={recargar}>
              REINTENTAR
            </button>
          </div>
        )}

        {!cargando && !error && proyectos.length === 0 && (
          <p className="pscreen__msg">&gt; aun no hay proyectos publicados.</p>
        )}

        {!cargando && !error && proyectos.length > 0 && (
          <ul className="pscreen__list">
            {proyectos.map((p) => (
              <li key={p.id} className="pscreen__card">
                {p.imagen_url && (
                  <img className="pscreen__thumb" src={p.imagen_url} alt={p.titulo} loading="lazy" />
                )}
                <div className="pscreen__info">
                  <h3 className="pscreen__name">
                    {p.destacado && <span className="pscreen__star">★</span>}
                    {p.titulo}
                  </h3>
                  {p.descripcion && <p className="pscreen__desc">{p.descripcion}</p>}
                  {p.etiquetas?.length > 0 && (
                    <ul className="pscreen__tags">
                      {p.etiquetas.map((t) => (
                        <li key={t} className="pscreen__tag">{t}</li>
                      ))}
                    </ul>
                  )}
                  <div className="pscreen__actions">
                    {p.repo_url && (
                      <a href={p.repo_url} target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">
                        <img className="pscreen__icon" src={githubIcon} alt="GitHub" />
                      </a>
                    )}
                    {p.demo_url && (
                      <a href={p.demo_url} target="_blank" rel="noopener noreferrer" title="Enlace" aria-label="Enlace">
                        <img className="pscreen__icon" src={linkIcon} alt="Enlace" />
                      </a>
                    )}
                  </div>
                  {autenticado && (
                    <div className="pscreen__card-admin">
                      <button type="button" className="zone-btn zone-btn--ghost" onClick={() => abrirEdicion(p)}>EDITAR</button>
                      <button type="button" className="zone-btn zone-btn--danger" onClick={() => eliminar(p.id)}>BORRAR</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pscreen__scanlines" aria-hidden="true" />
    </div>
  )
}
