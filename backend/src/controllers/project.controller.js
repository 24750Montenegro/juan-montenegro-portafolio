// Controladores HTTP para los endpoints de proyectos
import { asyncHandler } from '../utils/asyncHandler.js';
import * as projectService from '../services/project.service.js';

// Lista todos los proyectos publicados
export const getProyectos = asyncHandler(async (req, res) => {
  res.json(await projectService.obtenerTodos());
});

// Obtiene un proyecto concreto por id
export const getProyecto = asyncHandler(async (req, res) => {
  res.json(await projectService.obtenerPorId(Number(req.params.id)));
});

// Crea un proyecto a partir del formulario y la imagen adjunta
export const postProyecto = asyncHandler(async (req, res) => {
  res.status(201).json(await projectService.crear(req.body, req.file));
});

// Actualiza un proyecto existente
export const putProyecto = asyncHandler(async (req, res) => {
  res.json(await projectService.actualizar(Number(req.params.id), req.body, req.file));
});

// Elimina un proyecto por id
export const deleteProyecto = asyncHandler(async (req, res) => {
  await projectService.eliminar(Number(req.params.id));
  res.status(204).send();
});
