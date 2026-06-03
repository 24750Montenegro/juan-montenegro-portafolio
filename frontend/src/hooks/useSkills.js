// Hook para cargar y recargar la lista de conocimientos
import { useCallback, useEffect, useState } from 'react';
import { apiListarConocimientos } from '../api/skillsApi.js';

export const useSkills = () => {
  const [conocimientos, setConocimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Pide la lista de conocimientos al backend y actualiza el estado
  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    apiListarConocimientos()
      .then(setConocimientos)
      .catch(() => setError('No se pudieron cargar los conocimientos'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { conocimientos, cargando, error, recargar };
};
