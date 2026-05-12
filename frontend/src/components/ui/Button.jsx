// Boton reutilizable con variantes de estilo
import './Button.css';

export function Button({ variante = 'primario', tipo = 'button', children, ...resto }) {
  return (
    <button type={tipo} className={`boton boton--${variante}`} {...resto}>
      {children}
    </button>
  );
}
