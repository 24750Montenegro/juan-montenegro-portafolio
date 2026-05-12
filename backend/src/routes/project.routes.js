// Rutas de proyectos: lectura publica, escritura protegida por token
import { Router } from 'express';
import { requiereAuth } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { subida } from '../middlewares/upload.middleware.js';
import { esquemaCrearProyecto, esquemaActualizarProyecto } from '../schemas/project.schema.js';
import {
  getProyectos, getProyecto, postProyecto, putProyecto, deleteProyecto,
} from '../controllers/project.controller.js';

export const projectRouter = Router();

projectRouter.get('/', getProyectos);
projectRouter.get('/:id', getProyecto);
projectRouter.post('/', requiereAuth, subida.single('imagen'), validar(esquemaCrearProyecto), postProyecto);
projectRouter.put('/:id', requiereAuth, subida.single('imagen'), validar(esquemaActualizarProyecto), putProyecto);
projectRouter.delete('/:id', requiereAuth, deleteProyecto);
