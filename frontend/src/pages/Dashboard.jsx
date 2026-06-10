// Panel de administracion para crear y eliminar proyectos del portafolio
import { useState } from 'react';
import { useProjects } from '../hooks/useProjects.js';
import { useLanguage } from '../hooks/useLanguage.js';
import { apiCrearProyecto, apiEliminarProyecto } from '../api/projectsApi.js';
import { Button } from '../components/ui/Button.jsx';
import './Dashboard.css';

const FORMULARIO_INICIAL = { titulo: '', descripcion: '', repoUrl: '', demoUrl: '', etiquetas: '' };
const ENLACE_VACIO = { etiqueta: '', url: '' };

export function Dashboard() {
  const { proyectos, cargando, recargar } = useProjects();
  const { t } = useLanguage();
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [enlaces, setEnlaces] = useState([]);
  const [imagen, setImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Actualiza el campo del formulario que cambio
  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  // Editor de enlaces adicionales (repos separados, docs, etc.)
  const agregarEnlace = () => setEnlaces((previos) => [...previos, { ...ENLACE_VACIO }]);
  const cambiarEnlace = (indice, campo, valor) =>
    setEnlaces((previos) => previos.map((enlace, i) => (
      i === indice ? { ...enlace, [campo]: valor } : enlace
    )));
  const quitarEnlace = (indice) =>
    setEnlaces((previos) => previos.filter((_, i) => i !== indice));

  // Arma el FormData y crea el proyecto en el servidor
  const crear = async (evento) => {
    evento.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const datos = new FormData();
      Object.entries(formulario).forEach(([clave, valor]) => datos.append(clave, valor));
      datos.append('enlaces', JSON.stringify(enlaces.filter((enlace) => enlace.url.trim())));
      if (imagen) datos.append('imagen', imagen);
      await apiCrearProyecto(datos);
      setFormulario(FORMULARIO_INICIAL);
      setEnlaces([]);
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
        <fieldset className="panel__enlaces">
          <legend>{t('projectsScreen.links')}</legend>
          {enlaces.map((enlace, indice) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={indice} className="panel__enlace-fila">
              <input
                value={enlace.etiqueta}
                maxLength={40}
                placeholder={t('projectsScreen.linkLabelPlaceholder')}
                aria-label={t('projectsScreen.linkLabel')}
                onChange={(evento) => cambiarEnlace(indice, 'etiqueta', evento.target.value)}
              />
              <input
                type="url"
                value={enlace.url}
                placeholder="https://..."
                aria-label={t('projectsScreen.linkUrl')}
                onChange={(evento) => cambiarEnlace(indice, 'url', evento.target.value)}
              />
              <button
                type="button"
                className="panel__eliminar"
                aria-label={t('projectsScreen.removeLink')}
                onClick={() => quitarEnlace(indice)}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="panel__agregar-enlace" onClick={agregarEnlace}>
            {t('projectsScreen.addLink')}
          </button>
        </fieldset>
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
