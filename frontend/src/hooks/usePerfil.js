// Hook para cargar y recargar el perfil (contacto y PDF del portafolio)
import { useCallback, useEffect, useState } from 'react';
import { apiObtenerPerfil } from '../api/perfilApi.js';

export const usePerfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Pide el perfil al backend y actualiza el estado
  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    apiObtenerPerfil()
      .then(setPerfil)
      .catch(() => setError('No se pudo cargar el perfil'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { perfil, cargando, error, recargar };
};
