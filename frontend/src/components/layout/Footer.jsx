// Pie de pagina del portafolio
import './Footer.css';

export function Footer() {
  const anio = new Date().getFullYear();
  return (
    <footer className="pie">
      <div className="pie__interior">
        <span>Juan Montenegro</span>
        <span>{anio}</span>
      </div>
    </footer>
  );
}
