// Llamadas HTTP del perfil: datos de contacto y PDF del portafolio
import { cliente } from './axiosClient.js';

// Obtiene el perfil publico
export const apiObtenerPerfil = () =>
  cliente.get('/perfil').then((respuesta) => respuesta.data);

// Actualiza el contacto y, si el FormData incluye un PDF, lo reemplaza
export const apiActualizarPerfil = (formData) =>
  cliente.put('/perfil', formData).then((respuesta) => respuesta.data);

// Elimina el PDF del perfil
export const apiEliminarPdf = () =>
  cliente.delete('/perfil/pdf').then((respuesta) => respuesta.data);
