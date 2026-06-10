// Acceso a datos de la tabla proyectos
import { query } from '../config/db.js';

// Devuelve todos los proyectos ordenados por orden y fecha
export const listarProyectos = async () => {
  const { rows } = await query(
    'SELECT * FROM proyectos ORDER BY orden ASC, creado_en DESC',
  );
  return rows;
};

// Obtiene un proyecto por id; devuelve null si no existe
export const obtenerProyecto = async (id) => {
  const { rows } = await query('SELECT * FROM proyectos WHERE id = $1', [id]);
  return rows[0] || null;
};

// Inserta un proyecto y devuelve el registro creado
export const insertarProyecto = async (datos) => {
  const {
    titulo, descripcion, imagenUrl, imagenId, repoUrl, demoUrl, enlaces, etiquetas, destacado, orden,
  } = datos;
  const { rows } = await query(
    `INSERT INTO proyectos
       (titulo, descripcion, imagen_url, imagen_id, repo_url, demo_url, enlaces, etiquetas, destacado, orden)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    // jsonb requiere el valor serializado (pg convertiria un arreglo JS a array de Postgres)
    [titulo, descripcion, imagenUrl, imagenId, repoUrl, demoUrl,
      JSON.stringify(enlaces ?? []), etiquetas, destacado, orden],
  );
  return rows[0];
};

// Actualiza solo los campos presentes en datos y devuelve el registro
export const actualizarProyecto = async (id, datos) => {
  const columnas = {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    imagen_url: datos.imagenUrl,
    imagen_id: datos.imagenId,
    repo_url: datos.repoUrl,
    demo_url: datos.demoUrl,
    enlaces: datos.enlaces === undefined ? undefined : JSON.stringify(datos.enlaces),
    etiquetas: datos.etiquetas,
    destacado: datos.destacado,
    orden: datos.orden,
  };
  const entradas = Object.entries(columnas).filter(([, valor]) => valor !== undefined);
  if (entradas.length === 0) return obtenerProyecto(id);
  // Se arman las asignaciones dinamicas a partir del indice del parametro
  const asignaciones = entradas.map(([col], i) => `${col} = $${i + 2}`).join(', ');
  const valores = entradas.map(([, valor]) => valor);
  const { rows } = await query(
    `UPDATE proyectos SET ${asignaciones}, actualizado_en = NOW() WHERE id = $1 RETURNING *`,
    [id, ...valores],
  );
  return rows[0] || null;
};

// Elimina un proyecto y devuelve su imagen_id para limpiar Cloudinary
export const eliminarProyecto = async (id) => {
  const { rows } = await query(
    'DELETE FROM proyectos WHERE id = $1 RETURNING imagen_id',
    [id],
  );
  return rows[0] || null;
};
