// Acceso a datos de la tabla resenas
import { query } from '../config/db.js';

// Devuelve todas las resenas, las mas recientes primero
export const listarResenas = async () => {
  const { rows } = await query('SELECT * FROM resenas ORDER BY creado_en DESC');
  return rows;
};

// Inserta una resena y devuelve el registro creado
export const insertarResena = async (datos) => {
  const { nombre, calificacion, comentario } = datos;
  const { rows } = await query(
    `INSERT INTO resenas (nombre, calificacion, comentario)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nombre, calificacion, comentario],
  );
  return rows[0];
};

// Elimina una resena; devuelve el id eliminado o null
export const eliminarResena = async (id) => {
  const { rows } = await query(
    'DELETE FROM resenas WHERE id = $1 RETURNING id',
    [id],
  );
  return rows[0] || null;
};
