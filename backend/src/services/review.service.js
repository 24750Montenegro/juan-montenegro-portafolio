// Logica de negocio para gestionar las resenas de los visitantes
import {
  listarResenas, insertarResena, eliminarResena,
} from '../models/review.model.js';

// Crea un error con codigo HTTP y mensaje publico asociado
const error = (status, publico) => Object.assign(new Error(publico), { status, publico });

export const obtenerTodas = () => listarResenas();

export const crear = (datos) => insertarResena(datos);

// Elimina una resena o falla con 404
export const eliminar = async (id) => {
  const eliminada = await eliminarResena(id);
  if (!eliminada) throw error(404, 'Resena no encontrada');
};
