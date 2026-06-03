// Acceso a datos de la tabla logros
import { query } from '../config/db.js';

// Devuelve todos los logros ordenados por orden y fecha de creacion
export const listarLogros = async () => {
  const { rows } = await query(
    'SELECT * FROM logros ORDER BY orden ASC, creado_en DESC',
  );
  return rows;
};

// Obtiene un logro por id; devuelve null si no existe
export const obtenerLogro = async (id) => {
  const { rows } = await query('SELECT * FROM logros WHERE id = $1', [id]);
  return rows[0] || null;
};

// Inserta un logro y devuelve el registro creado
export const insertarLogro = async (datos) => {
  const { titulo, descripcion, fecha, imagenUrl, imagenId, orden } = datos;
  const { rows } = await query(
    `INSERT INTO logros (titulo, descripcion, fecha, imagen_url, imagen_id, orden)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [titulo, descripcion, fecha, imagenUrl, imagenId, orden],
  );
  return rows[0];
};

// Actualiza solo los campos presentes en datos y devuelve el registro
export const actualizarLogro = async (id, datos) => {
  const columnas = {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    fecha: datos.fecha,
    imagen_url: datos.imagenUrl,
    imagen_id: datos.imagenId,
    orden: datos.orden,
  };
  const entradas = Object.entries(columnas).filter(([, valor]) => valor !== undefined);
  if (entradas.length === 0) return obtenerLogro(id);
  const asignaciones = entradas.map(([col], i) => `${col} = $${i + 2}`).join(', ');
  const valores = entradas.map(([, valor]) => valor);
  const { rows } = await query(
    `UPDATE logros SET ${asignaciones}, actualizado_en = NOW() WHERE id = $1 RETURNING *`,
    [id, ...valores],
  );
  return rows[0] || null;
};

// Elimina un logro y devuelve su imagen_id para limpiar Cloudinary
export const eliminarLogro = async (id) => {
  const { rows } = await query(
    'DELETE FROM logros WHERE id = $1 RETURNING imagen_id',
    [id],
  );
  return rows[0] || null;
};
