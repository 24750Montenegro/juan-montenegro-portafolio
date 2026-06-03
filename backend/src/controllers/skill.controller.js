// Controladores HTTP para los endpoints de conocimientos
import { asyncHandler } from '../utils/asyncHandler.js';
import * as skillService from '../services/skill.service.js';

// Lista todos los conocimientos
export const getConocimientos = asyncHandler(async (req, res) => {
  res.json(await skillService.obtenerTodos());
});

// Obtiene un conocimiento concreto por id
export const getConocimiento = asyncHandler(async (req, res) => {
  res.json(await skillService.obtenerPorId(Number(req.params.id)));
});

// Crea un conocimiento a partir del formulario y el logo adjunto
export const postConocimiento = asyncHandler(async (req, res) => {
  res.status(201).json(await skillService.crear(req.body, req.file));
});

// Actualiza un conocimiento existente
export const putConocimiento = asyncHandler(async (req, res) => {
  res.json(await skillService.actualizar(Number(req.params.id), req.body, req.file));
});

// Elimina un conocimiento por id
export const deleteConocimiento = asyncHandler(async (req, res) => {
  await skillService.eliminar(Number(req.params.id));
  res.status(204).send();
});
