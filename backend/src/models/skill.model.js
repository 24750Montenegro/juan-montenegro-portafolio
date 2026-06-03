// Acceso a datos de la tabla conocimientos
import { query } from '../config/db.js';

// Devuelve todos los conocimientos ordenados por orden y nombre
export const listarConocimientos = async () => {
  const { rows } = await query(
    'SELECT * FROM conocimientos ORDER BY orden ASC, nombre ASC',
  );
  return rows;
};

// Obtiene un conocimiento por id; devuelve null si no existe
export const obtenerConocimiento = async (id) => {
  const { rows } = await query('SELECT * FROM conocimientos WHERE id = $1', [id]);
  return rows[0] || null;
};

// Inserta un conocimiento y devuelve el registro creado
export const insertarConocimiento = async (datos) => {
  const { nombre, categoria, nivel, orden } = datos;
  const { rows } = await query(
    `INSERT INTO conocimientos (nombre, categoria, nivel, orden)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [nombre, categoria, nivel, orden],
  );
  return rows[0];
};

// Actualiza solo los campos presentes en datos y devuelve el registro
export const actualizarConocimiento = async (id, datos) => {
  const columnas = {
    nombre: datos.nombre,
    categoria: datos.categoria,
    nivel: datos.nivel,
    orden: datos.orden,
  };
  const entradas = Object.entries(columnas).filter(([, valor]) => valor !== undefined);
  if (entradas.length === 0) return obtenerConocimiento(id);
  const asignaciones = entradas.map(([col], i) => `${col} = $${i + 2}`).join(', ');
  const valores = entradas.map(([, valor]) => valor);
  const { rows } = await query(
    `UPDATE conocimientos SET ${asignaciones}, actualizado_en = NOW() WHERE id = $1 RETURNING *`,
    [id, ...valores],
  );
  return rows[0] || null;
};

// Elimina un conocimiento; devuelve el id eliminado o null
export const eliminarConocimiento = async (id) => {
  const { rows } = await query(
    'DELETE FROM conocimientos WHERE id = $1 RETURNING id',
    [id],
  );
  return rows[0] || null;
};
