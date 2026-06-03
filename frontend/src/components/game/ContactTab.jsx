// Pestana de contacto de la zona social: visor del PDF del portafolio e iconos
// de contacto (gmail con mailto, github y linkedin). El administrador puede
// subir/reemplazar/quitar el PDF y editar los enlaces.
import { useState } from 'react'
import { usePerfil } from '../../hooks/usePerfil.js'
import { useAuth } from '../../hooks/useAuth.js'
import { apiActualizarPerfil, apiEliminarPdf } from '../../api/perfilApi.js'
import gmailIcon from '../../assets/gmail.png'
import githubIcon from '../../assets/github.png'
import linkedinIcon from '../../assets/linkedin.png'
import './zones.css'

export default function ContactTab() {
  const { perfil, cargando, error, recargar } = usePerfil()
  const { autenticado } = useAuth()
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ email: '', githubUrl: '', linkedinUrl: '' })
  const [pdf, setPdf] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errForm, setErrForm] = useState(null)

  const abrir = () => {
    setForm({
      email: perfil?.email || '',
      githubUrl: perfil?.github_url || '',
      linkedinUrl: perfil?.linkedin_url || '',
    })
    setPdf(null)
    setErrForm(null)
    setEditando(true)
  }
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
      datos.append('email', form.email)
      datos.append('githubUrl', form.githubUrl)
      datos.append('linkedinUrl', form.linkedinUrl)
      if (pdf) datos.append('pdf', pdf)
      await apiActualizarPerfil(datos)
      setEditando(false)
      recargar()
    } catch {
      setErrForm('No se pudo guardar el contacto')
    } finally {
      setGuardando(false)
    }
  }

  const quitarPdf = async () => {
    if (!window.confirm('Quitar el PDF del portafolio?')) return
    await apiEliminarPdf()
    recargar()
  }

  if (cargando) return <p className="zone-msg">&gt; cargando contacto<span className="zone-caret">_</span></p>
  if (error) {
    return (
      <div className="zone-msg zone-msg--err">
        <p>&gt; ERROR: {error}</p>
        <button type="button" className="zone-btn" onClick={recargar}>REINTENTAR</button>
      </div>
    )
  }

  return (
    <div className="contact">
      {autenticado && (
        <div className="zone-admin">
          <span className="zone-admin__tag">ADMIN</span>
          <button type="button" className="zone-btn" onClick={abrir}>EDITAR CONTACTO</button>
          {perfil?.pdf_url && (
            <button type="button" className="zone-btn zone-btn--danger" onClick={quitarPdf}>QUITAR PDF</button>
          )}
        </div>
      )}

      {autenticado && editando && (
        <form className="zone-form" onSubmit={enviar}>
          <label className="zone-field">
            <span>Email</span>
            <input className="zone-input" type="email" name="email" value={form.email} onChange={cambiar} maxLength={160} />
          </label>
          <label className="zone-field">
            <span>Enlace a GitHub</span>
            <input className="zone-input" type="url" name="githubUrl" value={form.githubUrl} onChange={cambiar} placeholder="https://github.com/..." />
          </label>
          <label className="zone-field">
            <span>Enlace a LinkedIn</span>
            <input className="zone-input" type="url" name="linkedinUrl" value={form.linkedinUrl} onChange={cambiar} placeholder="https://linkedin.com/in/..." />
          </label>
          <label className="zone-field">
            <span>PDF del portafolio (reemplaza el actual)</span>
            <input className="zone-input" type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0] || null)} />
          </label>
          {errForm && <p className="zone-error">{errForm}</p>}
          <div className="zone-form__actions">
            <button type="submit" className="zone-btn" disabled={guardando}>{guardando ? 'GUARDANDO...' : 'GUARDAR'}</button>
            <button type="button" className="zone-btn zone-btn--ghost" onClick={() => setEditando(false)}>CANCELAR</button>
          </div>
        </form>
      )}

      <h3 className="contact__title">PORTAFOLIO (PDF)</h3>
      {perfil?.pdf_url ? (
        <div className="contact__pdf">
          <iframe className="contact__viewer" src={perfil.pdf_url} title="Portafolio en PDF" />
          <a className="zone-btn zone-btn--ghost" href={perfil.pdf_url} target="_blank" rel="noopener noreferrer">
            ABRIR EN PESTANA NUEVA
          </a>
        </div>
      ) : (
        <p className="zone-msg">&gt; aun no hay un PDF publicado.</p>
      )}

      <h3 className="contact__title">CONTACTO</h3>
      {perfil?.email || perfil?.github_url || perfil?.linkedin_url ? (
        <ul className="contact__links">
          {perfil?.email && (
            <li>
              <a href={`mailto:${perfil.email}`} title={perfil.email} aria-label="Enviar correo">
                <img className="contact__icon" src={gmailIcon} alt="Email" />
              </a>
            </li>
          )}
          {perfil?.github_url && (
            <li>
              <a href={perfil.github_url} target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">
                <img className="contact__icon" src={githubIcon} alt="GitHub" />
              </a>
            </li>
          )}
          {perfil?.linkedin_url && (
            <li>
              <a href={perfil.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn">
                <img className="contact__icon" src={linkedinIcon} alt="LinkedIn" />
              </a>
            </li>
          )}
        </ul>
      ) : (
        <p className="zone-msg">&gt; aun no hay datos de contacto.</p>
      )}
    </div>
  )
}
