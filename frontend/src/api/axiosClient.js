// Instancia de Axios con base URL e interceptores de autenticacion
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const cliente = axios.create({ baseURL, timeout: 15000 });

const CLAVE_TOKEN = 'portafolio_token';

// Helpers para persistir el token de sesion en el navegador
export const guardarToken = (token) => localStorage.setItem(CLAVE_TOKEN, token);
export const leerToken = () => localStorage.getItem(CLAVE_TOKEN);
export const borrarToken = () => localStorage.removeItem(CLAVE_TOKEN);

// Adjunta el token Bearer en cada peticion saliente si existe
cliente.interceptors.request.use((config) => {
  const token = leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Limpia el token guardado si el servidor responde 401
cliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) borrarToken();
    return Promise.reject(error);
  },
);
