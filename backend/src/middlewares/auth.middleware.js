// Middleware que exige un token JWT valido y adjunta el usuario a la peticion
import { verificarToken } from '../utils/token.js';

export const requiereAuth = (req, res, next) => {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;
  if (!token) return res.status(401).json({ mensaje: 'No autenticado' });
  try {
    req.usuario = verificarToken(token);
    next();
  } catch {
    res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
};
