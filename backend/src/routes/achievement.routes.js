// Rutas de logros: lectura publica, escritura protegida por token
import { Router } from 'express';
import { requiereAuth } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { subida } from '../middlewares/upload.middleware.js';
import { esquemaCrearLogro, esquemaActualizarLogro } from '../schemas/achievement.schema.js';
import {
  getLogros, getLogro, postLogro, putLogro, deleteLogro,
} from '../controllers/achievement.controller.js';

export const achievementRouter = Router();

achievementRouter.get('/', getLogros);
achievementRouter.get('/:id', getLogro);
achievementRouter.post('/', requiereAuth, subida.single('imagen'), validar(esquemaCrearLogro), postLogro);
achievementRouter.put('/:id', requiereAuth, subida.single('imagen'), validar(esquemaActualizarLogro), putLogro);
achievementRouter.delete('/:id', requiereAuth, deleteLogro);
