// Controladores HTTP para los endpoints de logros
import { asyncHandler } from '../utils/asyncHandler.js';
import * as achievementService from '../services/achievement.service.js';

// Lista todos los logros
export const getLogros = asyncHandler(async (req, res) => {
  res.json(await achievementService.obtenerTodos());
});

// Obtiene un logro concreto por id
export const getLogro = asyncHandler(async (req, res) => {
  res.json(await achievementService.obtenerPorId(Number(req.params.id)));
});

// Crea un logro a partir del formulario y la imagen adjunta
export const postLogro = asyncHandler(async (req, res) => {
  res.status(201).json(await achievementService.crear(req.body, req.file));
});

// Actualiza un logro existente
export const putLogro = asyncHandler(async (req, res) => {
  res.json(await achievementService.actualizar(Number(req.params.id), req.body, req.file));
});

// Elimina un logro por id
export const deleteLogro = asyncHandler(async (req, res) => {
  await achievementService.eliminar(Number(req.params.id));
  res.status(204).send();
});
