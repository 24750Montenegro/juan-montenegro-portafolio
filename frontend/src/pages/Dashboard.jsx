// Panel de administracion para crear y eliminar proyectos del portafolio
import { useState } from 'react';
import { useProjects } from '../hooks/useProjects.js';
import { apiCrearProyecto, apiEliminarProyecto } from '../api/projectsApi.js';
import { Button } from '../components/ui/Button.jsx';
import './Dashboard.css';

const FORMULARIO_INICIAL = { titulo: '', descripcion: '', repoUrl: '', demoUrl: '', etiquetas: '' };

export function Dashboard() {
  const { proyectos, cargando, recargar } = useProjects();
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [imagen, setImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Actualiza el campo del formulario que cambio
  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  // Arma el FormData y crea el proyecto en el servidor
  const crear = async (evento) => {
    evento.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const datos = new FormData();
      Object.entries(formulario).forEach(([clave, valor]) => datos.append(clave, valor));
      if (imagen) datos.append('imagen', imagen);
      await apiCrearProyecto(datos);
      setFormulario(FORMULARIO_INICIAL);
      setImagen(null);
      recargar();
    } catch {
      setError('No se pudo crear el proyecto');
    } finally {
      setGuardando(false);
    }
  };

  // Elimina un proyecto tras confirmar la accion
  const eliminar = async (id) => {
    if (!window.confirm('Eliminar este proyecto?')) return;
    await apiEliminarProyecto(id);
    recargar();
  };

  return (
    <section className="panel">
      <h1 className="panel__titulo">Panel de proyectos</h1>

      <form className="panel__formulario" onSubmit={crear}>
        <h2>Nuevo proyecto</h2>
        <label className="panel__campo">
          <span>Titulo</span>
          <input name="titulo" value={formulario.titulo} onChange={cambiar} required maxLength={120} />
        </label>
        <label className="panel__campo">
          <span>Descripcion</span>
          <textarea name="descripcion" value={formulario.descripcion} onChange={cambiar} required rows={4} />
        </label>
        <label className="panel__campo">
          <span>Enlace al repositorio</span>
          <input name="repoUrl" type="url" value={formulario.repoUrl} onChange={cambiar} />
        </label>
        <label className="panel__campo">
          <span>Enlace a la demo</span>
          <input name="demoUrl" type="url" value={formulario.demoUrl} onChange={cambiar} />
        </label>
        <label className="panel__campo">
          <span>Etiquetas (separadas por coma)</span>
          <input name="etiquetas" value={formulario.etiquetas} onChange={cambiar} />
        </label>
        <label className="panel__campo">
          <span>Imagen</span>
          <input type="file" accept="image/*" onChange={(evento) => setImagen(evento.target.files[0] || null)} />
        </label>
        {error && <p className="panel__error">{error}</p>}
        <Button tipo="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear proyecto'}
        </Button>
      </form>

      <div className="panel__lista">
        <h2>Proyectos existentes</h2>
        {cargando ? (
          <p className="panel__aviso">Cargando...</p>
        ) : (
          <ul>
            {proyectos.map((proyecto) => (
              <li key={proyecto.id} className="panel__item">
                <span>{proyecto.titulo}</span>
                <button type="button" className="panel__eliminar" onClick={() => eliminar(proyecto.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
