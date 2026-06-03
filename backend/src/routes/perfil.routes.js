// Rutas de perfil: lectura publica, actualizacion y borrado de PDF protegidos
import { Router } from 'express';
import { requiereAuth } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { subidaPdf } from '../middlewares/upload.middleware.js';
import { esquemaActualizarPerfil } from '../schemas/perfil.schema.js';
import { getPerfilPublico, putPerfil, deletePerfilPdf } from '../controllers/perfil.controller.js';

export const perfilRouter = Router();

perfilRouter.get('/', getPerfilPublico);
perfilRouter.put('/', requiereAuth, subidaPdf.single('pdf'), validar(esquemaActualizarPerfil), putPerfil);
perfilRouter.delete('/pdf', requiereAuth, deletePerfilPdf);
