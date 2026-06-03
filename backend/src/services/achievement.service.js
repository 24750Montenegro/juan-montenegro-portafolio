// Logica de negocio para gestionar los logros del portafolio
import {
  listarLogros, obtenerLogro, insertarLogro, actualizarLogro, eliminarLogro,
} from '../models/achievement.model.js';
import { subirImagen, eliminarImagen } from './upload.service.js';

// Crea un error con codigo HTTP y mensaje publico asociado
const error = (status, publico) => Object.assign(new Error(publico), { status, publico });

const CARPETA = 'portafolio/logros';

export const obtenerTodos = () => listarLogros();

// Obtiene un logro por id o falla con 404
export const obtenerPorId = async (id) => {
  const logro = await obtenerLogro(id);
  if (!logro) throw error(404, 'Logro no encontrado');
  return logro;
};

// Crea un logro subiendo la imagen adjunta si existe
export const crear = async (datos, archivo) => {
  let imagen = { url: null, id: null };
  if (archivo) imagen = await subirImagen(archivo.buffer, CARPETA);
  return insertarLogro({ ...datos, imagenUrl: imagen.url, imagenId: imagen.id });
};

// Actualiza un logro y reemplaza su imagen si llega una nueva
export const actualizar = async (id, datos, archivo) => {
  const existente = await obtenerPorId(id);
  const cambios = { ...datos };
  if (archivo) {
    const imagen = await subirImagen(archivo.buffer, CARPETA);
    cambios.imagenUrl = imagen.url;
    cambios.imagenId = imagen.id;
    await eliminarImagen(existente.imagen_id);
  }
  return actualizarLogro(id, cambios);
};

// Elimina un logro y su imagen asociada en Cloudinary
export const eliminar = async (id) => {
  const eliminado = await eliminarLogro(id);
  if (!eliminado) throw error(404, 'Logro no encontrado');
  await eliminarImagen(eliminado.imagen_id);
};
