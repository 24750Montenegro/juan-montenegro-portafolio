// Hook para cargar y recargar la lista de resenas
import { useCallback, useEffect, useState } from 'react';
import { apiListarResenas } from '../api/reviewsApi.js';

export const useReviews = () => {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Pide la lista de resenas al backend y actualiza el estado
  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    apiListarResenas()
      .then(setResenas)
      .catch(() => setError('No se pudieron cargar las reseñas'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { resenas, cargando, error, recargar };
};
