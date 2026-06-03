// Rutas de conocimientos: lectura publica, escritura protegida por token
import { Router } from 'express';
import { requiereAuth } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { esquemaCrearConocimiento, esquemaActualizarConocimiento } from '../schemas/skill.schema.js';
import {
  getConocimientos, getConocimiento, postConocimiento, putConocimiento, deleteConocimiento,
} from '../controllers/skill.controller.js';

export const skillRouter = Router();

skillRouter.get('/', getConocimientos);
skillRouter.get('/:id', getConocimiento);
skillRouter.post('/', requiereAuth, validar(esquemaCrearConocimiento), postConocimiento);
skillRouter.put('/:id', requiereAuth, validar(esquemaActualizarConocimiento), putConocimiento);
skillRouter.delete('/:id', requiereAuth, deleteConocimiento);
