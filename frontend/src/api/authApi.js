// Llamadas HTTP relacionadas con la autenticacion
import { cliente } from './axiosClient.js';

// Inicia sesion con email y contrasena
export const apiLogin = (credenciales) =>
  cliente.post('/auth/login', credenciales).then((respuesta) => respuesta.data);

// Obtiene el usuario actual a partir del token guardado
export const apiPerfil = () =>
  cliente.get('/auth/perfil').then((respuesta) => respuesta.data);
