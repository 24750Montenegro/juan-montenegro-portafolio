// Controladores HTTP para los endpoints de resenas
import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewService from '../services/review.service.js';

// Lista todas las resenas
export const getResenas = asyncHandler(async (req, res) => {
  res.json(await reviewService.obtenerTodas());
});

// Crea una resena enviada por un visitante
export const postResena = asyncHandler(async (req, res) => {
  res.status(201).json(await reviewService.crear(req.body));
});

// Elimina una resena por id (solo admin)
export const deleteResena = asyncHandler(async (req, res) => {
  await reviewService.eliminar(Number(req.params.id));
  res.status(204).send();
});
