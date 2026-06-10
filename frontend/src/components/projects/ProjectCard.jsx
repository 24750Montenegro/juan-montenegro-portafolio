// Tarjeta que muestra los datos de un proyecto del portafolio
import { useLanguage } from '../../hooks/useLanguage.js';
import { optimizarImagen } from '../../utils/cloudinary.js';
import './ProjectCard.css';

export function ProjectCard({ proyecto }) {
  const { t } = useLanguage();
  const {
    titulo,
    descripcion,
    imagen_url: imagenUrl,
    repo_url: repoUrl,
    demo_url: demoUrl,
    enlaces,
    etiquetas,
  } = proyecto;

  return (
    <article className="tarjeta-proyecto">
      {imagenUrl && (
        <img
          className="tarjeta-proyecto__imagen"
          src={optimizarImagen(imagenUrl, 640)}
          alt={titulo}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="tarjeta-proyecto__cuerpo">
        <h3 className="tarjeta-proyecto__titulo">{titulo}</h3>
        <p className="tarjeta-proyecto__descripcion">{descripcion}</p>
        {etiquetas?.length > 0 && (
          <ul className="tarjeta-proyecto__etiquetas">
            {etiquetas.map((etiqueta) => <li key={etiqueta}>{etiqueta}</li>)}
          </ul>
        )}
        <div className="tarjeta-proyecto__acciones">
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">{t('projectCard.repo')}</a>
          )}
          {demoUrl && (
            <a href={demoUrl} target="_blank" rel="noopener noreferrer">{t('projectCard.demo')}</a>
          )}
          {Array.isArray(enlaces) && enlaces.map((enlace) => (
            <a key={enlace.url} href={enlace.url} target="_blank" rel="noopener noreferrer">
              {enlace.etiqueta || t('projectsScreen.link')}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
