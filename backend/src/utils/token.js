// Utilidades para firmar y verificar tokens JWT
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Firma un token con el payload dado y la expiracion configurada
export const firmarToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

// Verifica un token y devuelve su payload; lanza error si es invalido
export const verificarToken = (token) => jwt.verify(token, env.JWT_SECRET);
