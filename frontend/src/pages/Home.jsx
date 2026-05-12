// Pagina de inicio con una presentacion breve
import { Link } from 'react-router-dom';
import './Home.css';

export function Home() {
  return (
    <section className="inicio">
      <h1 className="inicio__titulo">Hola, soy Juan Montenegro</h1>
      <p className="inicio__subtitulo">
        Desarrollador de software. Construyo aplicaciones web full stack.
      </p>
      <Link to="/proyectos" className="inicio__cta">Ver proyectos</Link>
    </section>
  );
}
