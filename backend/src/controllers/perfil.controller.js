// Controladores HTTP para el perfil (contacto y PDF del portafolio)
import { asyncHandler } from '../utils/asyncHandler.js';
import * as perfilService from '../services/perfil.service.js';

// Devuelve el perfil publico
export const getPerfilPublico = asyncHandler(async (req, res) => {
  res.json(await perfilService.obtener());
});

// Actualiza el contacto y, si llega, reemplaza el PDF
export const putPerfil = asyncHandler(async (req, res) => {
  res.json(await perfilService.actualizar(req.body, req.file));
});

// Elimina el PDF del perfil
export const deletePerfilPdf = asyncHandler(async (req, res) => {
  res.json(await perfilService.eliminarPdf());
});
