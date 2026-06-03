// Llamadas HTTP relacionadas con los logros del portafolio
import { cliente } from './axiosClient.js';

// Lista todos los logros
export const apiListarLogros = () =>
  cliente.get('/logros').then((respuesta) => respuesta.data);

// Crea un logro enviando un FormData (incluye la imagen)
export const apiCrearLogro = (formData) =>
  cliente.post('/logros', formData).then((respuesta) => respuesta.data);

// Actualiza un logro existente
export const apiActualizarLogro = (id, formData) =>
  cliente.put(`/logros/${id}`, formData).then((respuesta) => respuesta.data);

// Elimina un logro por id
export const apiEliminarLogro = (id) => cliente.delete(`/logros/${id}`);
