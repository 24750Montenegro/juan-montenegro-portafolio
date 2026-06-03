// Acceso a datos de la tabla perfil (registro unico)
import { query } from '../config/db.js';

// Devuelve el perfil existente; null si aun no hay ninguno
export const obtenerPerfil = async () => {
  const { rows } = await query('SELECT * FROM perfil ORDER BY id ASC LIMIT 1');
  return rows[0] || null;
};

// Crea un perfil vacio y lo devuelve
export const crearPerfil = async () => {
  const { rows } = await query('INSERT INTO perfil DEFAULT VALUES RETURNING *');
  return rows[0];
};

// Actualiza solo los campos presentes en datos y devuelve el registro
export const actualizarPerfil = async (id, datos) => {
  const columnas = {
    email: datos.email,
    github_url: datos.githubUrl,
    linkedin_url: datos.linkedinUrl,
    pdf_url: datos.pdfUrl,
    pdf_id: datos.pdfId,
  };
  const entradas = Object.entries(columnas).filter(([, valor]) => valor !== undefined);
  if (entradas.length === 0) return obtenerPerfil();
  const asignaciones = entradas.map(([col], i) => `${col} = $${i + 2}`).join(', ');
  const valores = entradas.map(([, valor]) => valor);
  const { rows } = await query(
    `UPDATE perfil SET ${asignaciones}, actualizado_en = NOW() WHERE id = $1 RETURNING *`,
    [id, ...valores],
  );
  return rows[0] || null;
};
