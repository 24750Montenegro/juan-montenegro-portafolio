// Logica de negocio para gestionar los proyectos del portafolio
import {
  listarProyectos, obtenerProyecto, insertarProyecto, actualizarProyecto, eliminarProyecto,
} from '../models/project.model.js';
import { subirImagen, eliminarImagen } from './upload.service.js';

// Crea un error con codigo HTTP y mensaje publico asociado
const error = (status, publico) => Object.assign(new Error(publico), { status, publico });

export const obtenerTodos = () => listarProyectos();

// Obtiene un proyecto por id o falla con 404
export const obtenerPorId = async (id) => {
  const proyecto = await obtenerProyecto(id);
  if (!proyecto) throw error(404, 'Proyecto no encontrado');
  return proyecto;
};

// Crea un proyecto subiendo la imagen adjunta si existe
export const crear = async (datos, archivo) => {
  let imagen = { url: null, id: null };
  if (archivo) imagen = await subirImagen(archivo.buffer);
  return insertarProyecto({ ...datos, imagenUrl: imagen.url, imagenId: imagen.id });
};

// Actualiza un proyecto y reemplaza su imagen si llega una nueva
export const actualizar = async (id, datos, archivo) => {
  const existente = await obtenerPorId(id);
  const cambios = { ...datos };
  if (archivo) {
    const imagen = await subirImagen(archivo.buffer);
    cambios.imagenUrl = imagen.url;
    cambios.imagenId = imagen.id;
    await eliminarImagen(existente.imagen_id);
  }
  return actualizarProyecto(id, cambios);
};

// Elimina un proyecto y su imagen asociada en Cloudinary
export const eliminar = async (id) => {
  const eliminado = await eliminarProyecto(id);
  if (!eliminado) throw error(404, 'Proyecto no encontrado');
  await eliminarImagen(eliminado.imagen_id);
};
