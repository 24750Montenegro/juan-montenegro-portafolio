// Panel de administracion para crear y eliminar proyectos del portafolio
import { useState } from 'react';
import { useProjects } from '../hooks/useProjects.js';
import { useLanguage } from '../hooks/useLanguage.js';
import { apiCrearProyecto, apiEliminarProyecto } from '../api/projectsApi.js';
import { Button } from '../components/ui/Button.jsx';
import './Dashboard.css';

const FORMULARIO_INICIAL = { titulo: '', descripcion: '', repoUrl: '', demoUrl: '', etiquetas: '' };

export function Dashboard() {
  const { proyectos, cargando, recargar } = useProjects();
  const { t } = useLanguage();
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
      setError(t('dashboard.createError'));
    } finally {
      setGuardando(false);
    }
  };

  // Elimina un proyecto tras confirmar la accion
  const eliminar = async (id) => {
    if (!window.confirm(t('dashboard.deleteConfirm'))) return;
    await apiEliminarProyecto(id);
    recargar();
  };

  return (
    <section className="panel">
      <h1 className="panel__titulo">{t('dashboard.title')}</h1>

      <form className="panel__formulario" onSubmit={crear}>
        <h2>{t('dashboard.newProject')}</h2>
        <label className="panel__campo">
          <span>{t('dashboard.titleField')}</span>
          <input name="titulo" value={formulario.titulo} onChange={cambiar} required maxLength={120} />
        </label>
        <label className="panel__campo">
          <span>{t('dashboard.description')}</span>
          <textarea name="descripcion" value={formulario.descripcion} onChange={cambiar} required rows={4} />
        </label>
        <label className="panel__campo">
          <span>{t('dashboard.repoLink')}</span>
          <input name="repoUrl" type="url" value={formulario.repoUrl} onChange={cambiar} />
        </label>
        <label className="panel__campo">
          <span>{t('dashboard.demoLink')}</span>
          <input name="demoUrl" type="url" value={formulario.demoUrl} onChange={cambiar} />
        </label>
        <label className="panel__campo">
          <span>{t('dashboard.tags')}</span>
          <input name="etiquetas" value={formulario.etiquetas} onChange={cambiar} />
        </label>
        <label className="panel__campo">
          <span>{t('dashboard.image')}</span>
          <input type="file" accept="image/*" onChange={(evento) => setImagen(evento.target.files[0] || null)} />
        </label>
        {error && <p className="panel__error">{error}</p>}
        <Button tipo="submit" disabled={guardando}>
          {guardando ? t('dashboard.saving') : t('dashboard.create')}
        </Button>
      </form>

      <div className="panel__lista">
        <h2>{t('dashboard.existing')}</h2>
        {cargando ? (
          <p className="panel__aviso">{t('dashboard.loading')}</p>
        ) : (
          <ul>
            {proyectos.map((proyecto) => (
              <li key={proyecto.id} className="panel__item">
                <span>{proyecto.titulo}</span>
                <button type="button" className="panel__eliminar" onClick={() => eliminar(proyecto.id)}>
                  {t('dashboard.delete')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
