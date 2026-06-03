// Llamadas HTTP relacionadas con las resenas de los visitantes
import { cliente } from './axiosClient.js';

// Lista todas las resenas
export const apiListarResenas = () =>
  cliente.get('/resenas').then((respuesta) => respuesta.data);

// Crea una resena (publico)
export const apiCrearResena = (datos) =>
  cliente.post('/resenas', datos).then((respuesta) => respuesta.data);

// Elimina una resena por id (solo admin)
export const apiEliminarResena = (id) => cliente.delete(`/resenas/${id}`);
