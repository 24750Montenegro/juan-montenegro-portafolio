// Acceso a datos de la tabla usuarios
import { query } from '../config/db.js';

// Busca un usuario por su email; devuelve null si no existe
export const buscarUsuarioPorEmail = async (email) => {
  const { rows } = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return rows[0] || null;
};

// Inserta un nuevo usuario y devuelve sus datos publicos
export const crearUsuario = async ({ nombre, email, passwordHash }) => {
  const { rows } = await query(
    `INSERT INTO usuarios (nombre, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, email, creado_en`,
    [nombre, email, passwordHash],
  );
  return rows[0];
};

// Cuenta cuantos usuarios existen registrados
export const contarUsuarios = async () => {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM usuarios');
  return rows[0].total;
};
