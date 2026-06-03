// Llamadas HTTP relacionadas con los conocimientos del portafolio
import { cliente } from './axiosClient.js';

// Lista todos los conocimientos
export const apiListarConocimientos = () =>
  cliente.get('/conocimientos').then((respuesta) => respuesta.data);

// Crea un conocimiento enviando un FormData (incluye el logo)
export const apiCrearConocimiento = (formData) =>
  cliente.post('/conocimientos', formData).then((respuesta) => respuesta.data);

// Actualiza un conocimiento existente
export const apiActualizarConocimiento = (id, formData) =>
  cliente.put(`/conocimientos/${id}`, formData).then((respuesta) => respuesta.data);

// Elimina un conocimiento por id
export const apiEliminarConocimiento = (id) => cliente.delete(`/conocimientos/${id}`);
