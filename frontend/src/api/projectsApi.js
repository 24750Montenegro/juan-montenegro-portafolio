// Llamadas HTTP relacionadas con los proyectos del portafolio
import { cliente } from './axiosClient.js';

// Lista todos los proyectos publicados
export const apiListarProyectos = () =>
  cliente.get('/proyectos').then((respuesta) => respuesta.data);

// Crea un proyecto enviando un FormData (incluye la imagen)
export const apiCrearProyecto = (formData) =>
  cliente.post('/proyectos', formData).then((respuesta) => respuesta.data);

// Actualiza un proyecto existente
export const apiActualizarProyecto = (id, formData) =>
  cliente.put(`/proyectos/${id}`, formData).then((respuesta) => respuesta.data);

// Elimina un proyecto por id
export const apiEliminarProyecto = (id) => cliente.delete(`/proyectos/${id}`);
