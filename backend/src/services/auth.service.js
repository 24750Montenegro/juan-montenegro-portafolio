// Logica de negocio para registro e inicio de sesion del administrador
import bcrypt from 'bcryptjs';
import {
  buscarUsuarioPorEmail, crearUsuario, contarUsuarios,
} from '../models/user.model.js';
import { firmarToken } from '../utils/token.js';

// Crea un error con codigo HTTP y mensaje publico asociado
const error = (status, publico) => Object.assign(new Error(publico), { status, publico });

// Registra al unico usuario administrador; falla si ya existe alguno
export const registrar = async ({ nombre, email, password }) => {
  if ((await contarUsuarios()) > 0) throw error(403, 'El registro esta deshabilitado');
  if (await buscarUsuarioPorEmail(email)) throw error(409, 'El email ya esta registrado');
  const passwordHash = await bcrypt.hash(password, 12);
  const usuario = await crearUsuario({ nombre, email, passwordHash });
  return { usuario, token: firmarToken({ id: usuario.id, email: usuario.email }) };
};

// Valida credenciales y devuelve el usuario publico junto a un token
export const iniciarSesion = async ({ email, password }) => {
  const usuario = await buscarUsuarioPorEmail(email);
  if (!usuario) throw error(401, 'Credenciales invalidas');
  const valido = await bcrypt.compare(password, usuario.password_hash);
  if (!valido) throw error(401, 'Credenciales invalidas');
  const publico = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  return { usuario: publico, token: firmarToken({ id: usuario.id, email: usuario.email }) };
};
