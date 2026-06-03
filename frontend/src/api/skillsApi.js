// Llamadas HTTP relacionadas con los conocimientos del portafolio
import { cliente } from './axiosClient.js';

// Lista todos los conocimientos
export const apiListarConocimientos = () =>
  cliente.get('/conocimientos').then((respuesta) => respuesta.data);

// Crea un conocimiento
export const apiCrearConocimiento = (datos) =>
  cliente.post('/conocimientos', datos).then((respuesta) => respuesta.data);

// Actualiza un conocimiento existente
export const apiActualizarConocimiento = (id, datos) =>
  cliente.put(`/conocimientos/${id}`, datos).then((respuesta) => respuesta.data);

// Elimina un conocimiento por id
export const apiEliminarConocimiento = (id) => cliente.delete(`/conocimientos/${id}`);
