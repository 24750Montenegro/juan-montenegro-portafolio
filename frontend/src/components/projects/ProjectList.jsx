// Cuadricula responsive de tarjetas de proyectos
import { ProjectCard } from './ProjectCard.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import './ProjectList.css';

export function ProjectList({ proyectos }) {
  const { t } = useLanguage();
  if (proyectos.length === 0) {
    return <p className="lista-proyectos__vacio">{t('projects.empty')}</p>;
  }
  return (
    <div className="lista-proyectos">
      {proyectos.map((proyecto) => <ProjectCard key={proyecto.id} proyecto={proyecto} />)}
    </div>
  );
}
