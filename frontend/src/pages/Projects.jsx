// Pagina publica que lista todos los proyectos del portafolio
import { useProjects } from '../hooks/useProjects.js';
import { ProjectList } from '../components/projects/ProjectList.jsx';
import './Projects.css';

export function Projects() {
  const { proyectos, cargando, error } = useProjects();

  return (
    <section className="proyectos">
      <h1 className="proyectos__titulo">Proyectos</h1>
      {cargando && <p className="proyectos__aviso">Cargando proyectos...</p>}
      {error && <p className="proyectos__error">{error}</p>}
      {!cargando && !error && <ProjectList proyectos={proyectos} />}
    </section>
  );
}
