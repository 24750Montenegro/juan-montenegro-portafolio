// Controladores HTTP para los endpoints de autenticacion
import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

// Registra al administrador inicial del portafolio
export const postRegistro = asyncHandler(async (req, res) => {
  const datos = await authService.registrar(req.body);
  res.status(201).json(datos);
});

// Inicia sesion y devuelve usuario con token
export const postLogin = asyncHandler(async (req, res) => {
  const datos = await authService.iniciarSesion(req.body);
  res.json(datos);
});

// Devuelve el usuario actual extraido del token verificado
export const getPerfil = asyncHandler(async (req, res) => {
  res.json({ usuario: req.usuario });
});
