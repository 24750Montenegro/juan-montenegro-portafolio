// Rutas de resenas: lectura y creacion publicas, borrado protegido por token
import { Router } from 'express';
import { requiereAuth } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { esquemaCrearResena } from '../schemas/review.schema.js';
import { getResenas, postResena, deleteResena } from '../controllers/review.controller.js';

export const reviewRouter = Router();

reviewRouter.get('/', getResenas);
reviewRouter.post('/', validar(esquemaCrearResena), postResena);
reviewRouter.delete('/:id', requiereAuth, deleteResena);
