// Hook para cargar y recargar la lista de proyectos del portafolio
import { useCallback, useEffect, useState } from 'react';
import { apiListarProyectos } from '../api/projectsApi.js';

export const useProjects = () => {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Pide la lista de proyectos al backend y actualiza el estado
  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    apiListarProyectos()
      .then(setProyectos)
      .catch(() => setError('No se pudieron cargar los proyectos'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { proyectos, cargando, error, recargar };
};
