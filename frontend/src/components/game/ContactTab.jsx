// Pestana de contacto de la zona social: visor del PDF del portafolio e iconos
// de contacto (gmail con mailto, github y linkedin). El administrador puede
// subir/reemplazar/quitar el PDF y editar los enlaces.
import { useState } from 'react'
import { usePerfil } from '../../hooks/usePerfil.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import { apiActualizarPerfil, apiEliminarPdf } from '../../api/perfilApi.js'
import gmailIcon from '../../assets/gmail.webp'
import githubIcon from '../../assets/github.webp'
import linkedinIcon from '../../assets/linkedin.webp'
import caraFoto from '../../assets/cara1.webp'
import './zones.css'

export default function ContactTab() {
  const { perfil, cargando, error, recargar } = usePerfil()
  const { autenticado } = useAuth()
  const { t } = useLanguage()
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
      setErrForm(t('contact.saveError'))
    } finally {
      setGuardando(false)
    }
  }

  const quitarPdf = async () => {
    if (!window.confirm(t('contact.removePdfConfirm'))) return
    await apiEliminarPdf()
    recargar()
  }

  if (cargando) return <p className="zone-msg">{t('contact.loading')}<span className="zone-caret">_</span></p>
  if (error) {
    return (
      <div className="zone-msg zone-msg--err">
        <p>&gt; ERROR: {error}</p>
        <button type="button" className="zone-btn" onClick={recargar}>{t('common.retry')}</button>
      </div>
    )
  }

  return (
    <div className="contact">
      {autenticado && (
        <div className="zone-admin">
          <span className="zone-admin__tag">{t('common.admin')}</span>
          <button type="button" className="zone-btn" onClick={abrir}>{t('contact.editContact')}</button>
          {perfil?.pdf_url && (
            <button type="button" className="zone-btn zone-btn--danger" onClick={quitarPdf}>{t('contact.removePdf')}</button>
          )}
        </div>
      )}

      {autenticado && editando && (
        <form className="zone-form" onSubmit={enviar}>
          <label className="zone-field">
            <span>{t('contact.email')}</span>
            <input className="zone-input" type="email" name="email" value={form.email} onChange={cambiar} maxLength={160} />
          </label>
          <label className="zone-field">
            <span>{t('contact.githubLink')}</span>
            <input className="zone-input" type="url" name="githubUrl" value={form.githubUrl} onChange={cambiar} placeholder="https://github.com/..." />
          </label>
          <label className="zone-field">
            <span>{t('contact.linkedinLink')}</span>
            <input className="zone-input" type="url" name="linkedinUrl" value={form.linkedinUrl} onChange={cambiar} placeholder="https://linkedin.com/in/..." />
          </label>
          <label className="zone-field">
            <span>{t('contact.pdfField')}</span>
            <input className="zone-input" type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0] || null)} />
          </label>
          {errForm && <p className="zone-error">{errForm}</p>}
          <div className="zone-form__actions">
            <button type="submit" className="zone-btn" disabled={guardando}>{guardando ? t('common.saving') : t('common.save')}</button>
            <button type="button" className="zone-btn zone-btn--ghost" onClick={() => setEditando(false)}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      <h3 className="contact__title">{t('contact.aboutTitle')}</h3>
      <div className="about">
        <img className="about__photo" src={caraFoto} alt={t('contact.aboutPhotoAlt')} />
        <div className="about__info">
          <p className="about__name">{t('contact.aboutName')}</p>
          <p className="about__role">{t('contact.aboutRole')}</p>
          <p className="about__bio">{t('contact.aboutBio')}</p>
        </div>
      </div>

      <h3 className="contact__title">{t('contact.pdfTitle')}</h3>
      {perfil?.pdf_url ? (
        <div className="contact__pdf">
          <iframe className="contact__viewer" src={perfil.pdf_url} title={t('contact.viewerTitle')} />
          <a className="zone-btn zone-btn--ghost" href={perfil.pdf_url} target="_blank" rel="noopener noreferrer">
            {t('contact.openNewTab')}
          </a>
        </div>
      ) : (
        <p className="zone-msg">{t('contact.noPdf')}</p>
      )}

      <h3 className="contact__title">{t('contact.contactTitle')}</h3>
      {perfil?.email || perfil?.github_url || perfil?.linkedin_url ? (
        <ul className="contact__links">
          {perfil?.email && (
            <li>
              <a href={`mailto:${perfil.email}`} title={perfil.email} aria-label={t('contact.sendEmail')}>
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
        <p className="zone-msg">{t('contact.noContact')}</p>
      )}
    </div>
  )
}
