// Logica de negocio para gestionar los conocimientos del portafolio
import {
  listarConocimientos, obtenerConocimiento, insertarConocimiento,
  actualizarConocimiento, eliminarConocimiento,
} from '../models/skill.model.js';

// Crea un error con codigo HTTP y mensaje publico asociado
const error = (status, publico) => Object.assign(new Error(publico), { status, publico });

export const obtenerTodos = () => listarConocimientos();

// Obtiene un conocimiento por id o falla con 404
export const obtenerPorId = async (id) => {
  const conocimiento = await obtenerConocimiento(id);
  if (!conocimiento) throw error(404, 'Conocimiento no encontrado');
  return conocimiento;
};

export const crear = (datos) => insertarConocimiento(datos);

// Actualiza un conocimiento existente tras verificar que existe
export const actualizar = async (id, datos) => {
  await obtenerPorId(id);
  return actualizarConocimiento(id, datos);
};

// Elimina un conocimiento o falla con 404
export const eliminar = async (id) => {
  const eliminado = await eliminarConocimiento(id);
  if (!eliminado) throw error(404, 'Conocimiento no encontrado');
};
