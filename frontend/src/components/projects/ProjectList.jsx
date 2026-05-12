// Cuadricula responsive de tarjetas de proyectos
import { ProjectCard } from './ProjectCard.jsx';
import './ProjectList.css';

export function ProjectList({ proyectos }) {
  if (proyectos.length === 0) {
    return <p className="lista-proyectos__vacio">Aun no hay proyectos publicados.</p>;
  }
  return (
    <div className="lista-proyectos">
      {proyectos.map((proyecto) => <ProjectCard key={proyecto.id} proyecto={proyecto} />)}
    </div>
  );
}
