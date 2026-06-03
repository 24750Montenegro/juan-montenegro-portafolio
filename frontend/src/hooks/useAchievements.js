// Hook para cargar y recargar la lista de logros
import { useCallback, useEffect, useState } from 'react';
import { apiListarLogros } from '../api/achievementsApi.js';

export const useAchievements = () => {
  const [logros, setLogros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Pide la lista de logros al backend y actualiza el estado
  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    apiListarLogros()
      .then(setLogros)
      .catch(() => setError('No se pudieron cargar los logros'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { logros, cargando, error, recargar };
};
