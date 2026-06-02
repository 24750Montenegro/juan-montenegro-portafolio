// Contenido del monitor: lista de proyectos del portafolio (desde el backend),
// con estetica retro/pixelart para encajar con el cuarto.
import { useProjects } from '../../hooks/useProjects.js'
import './ProjectsScreen.css'

export default function ProjectsScreen() {
  const { proyectos, cargando, error, recargar } = useProjects()

  return (
    <div className="pscreen">
      <header className="pscreen__bar">
        <span className="pscreen__dot" />
        <span className="pscreen__title">PROYECTOS.EXE</span>
        <span className="pscreen__user">~/juan-montenegro</span>
      </header>

      <div className="pscreen__body">
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
                      <a href={p.repo_url} target="_blank" rel="noopener noreferrer">[ REPO ]</a>
                    )}
                    {p.demo_url && (
                      <a href={p.demo_url} target="_blank" rel="noopener noreferrer">[ DEMO ]</a>
                    )}
                  </div>
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
