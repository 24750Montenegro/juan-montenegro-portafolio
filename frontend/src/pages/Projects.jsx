// Pagina publica que lista todos los proyectos del portafolio
import { useProjects } from '../hooks/useProjects.js';
import { useLanguage } from '../hooks/useLanguage.js';
import { ProjectList } from '../components/projects/ProjectList.jsx';
import './Projects.css';

export function Projects() {
  const { proyectos, cargando, error } = useProjects();
  const { t } = useLanguage();

  return (
    <section className="proyectos">
      <h1 className="proyectos__titulo">{t('projects.title')}</h1>
      {cargando && <p className="proyectos__aviso">{t('projects.loading')}</p>}
      {error && <p className="proyectos__error">{error}</p>}
      {!cargando && !error && <ProjectList proyectos={proyectos} />}
    </section>
  );
}
