// Logica de negocio para gestionar los conocimientos del portafolio
import {
  listarConocimientos, obtenerConocimiento, insertarConocimiento,
  actualizarConocimiento, eliminarConocimiento,
} from '../models/skill.model.js';
import { subirImagen, eliminarImagen } from './upload.service.js';

// Crea un error con codigo HTTP y mensaje publico asociado
const error = (status, publico) => Object.assign(new Error(publico), { status, publico });

const CARPETA = 'portafolio/conocimientos';

export const obtenerTodos = () => listarConocimientos();

// Obtiene un conocimiento por id o falla con 404
export const obtenerPorId = async (id) => {
  const conocimiento = await obtenerConocimiento(id);
  if (!conocimiento) throw error(404, 'Conocimiento no encontrado');
  return conocimiento;
};

// Crea un conocimiento subiendo el logo adjunto si existe
export const crear = async (datos, archivo) => {
  let imagen = { url: null, id: null };
  if (archivo) imagen = await subirImagen(archivo.buffer, CARPETA);
  return insertarConocimiento({ ...datos, imagenUrl: imagen.url, imagenId: imagen.id });
};

// Actualiza un conocimiento y reemplaza su logo si llega uno nuevo
export const actualizar = async (id, datos, archivo) => {
  const existente = await obtenerPorId(id);
  const cambios = { ...datos };
  if (archivo) {
    const imagen = await subirImagen(archivo.buffer, CARPETA);
    cambios.imagenUrl = imagen.url;
    cambios.imagenId = imagen.id;
    await eliminarImagen(existente.imagen_id);
  }
  return actualizarConocimiento(id, cambios);
};

// Elimina un conocimiento y su logo asociado en Cloudinary
export const eliminar = async (id) => {
  const eliminado = await eliminarConocimiento(id);
  if (!eliminado) throw error(404, 'Conocimiento no encontrado');
  await eliminarImagen(eliminado.imagen_id);
};
