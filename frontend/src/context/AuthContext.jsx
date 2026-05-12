// Contexto de autenticacion: estado de sesion compartido en la SPA
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { apiLogin, apiPerfil } from '../api/authApi.js';
import { guardarToken, leerToken, borrarToken } from '../api/axiosClient.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar, recupera la sesion previa si existe un token guardado
  useEffect(() => {
    if (!leerToken()) {
      setCargando(false);
      return;
    }
    apiPerfil()
      .then((data) => setUsuario(data.usuario))
      .catch(() => borrarToken())
      .finally(() => setCargando(false));
  }, []);

  // Inicia sesion, guarda el token y actualiza el usuario
  const login = useCallback(async (credenciales) => {
    const { usuario: autenticado, token } = await apiLogin(credenciales);
    guardarToken(token);
    setUsuario(autenticado);
  }, []);

  // Cierra la sesion y limpia el token
  const logout = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, autenticado: Boolean(usuario), login, logout }),
    [usuario, cargando, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
