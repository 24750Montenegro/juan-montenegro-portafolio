// Tarjeta que muestra los datos de un proyecto del portafolio
import { useLanguage } from '../../hooks/useLanguage.js';
import './ProjectCard.css';

export function ProjectCard({ proyecto }) {
  const { t } = useLanguage();
  const {
    titulo,
    descripcion,
    imagen_url: imagenUrl,
    repo_url: repoUrl,
    demo_url: demoUrl,
    etiquetas,
  } = proyecto;

  return (
    <article className="tarjeta-proyecto">
      {imagenUrl && (
        <img className="tarjeta-proyecto__imagen" src={imagenUrl} alt={titulo} loading="lazy" />
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
        </div>
      </div>
    </article>
  );
}
