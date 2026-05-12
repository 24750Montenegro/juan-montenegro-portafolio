// Rutas de autenticacion: registro, login y perfil
import { Router } from 'express';
import { validar } from '../middlewares/validate.middleware.js';
import { requiereAuth } from '../middlewares/auth.middleware.js';
import { esquemaLogin, esquemaRegistro } from '../schemas/auth.schema.js';
import { postRegistro, postLogin, getPerfil } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/registro', validar(esquemaRegistro), postRegistro);
authRouter.post('/login', validar(esquemaLogin), postLogin);
authRouter.get('/perfil', requiereAuth, getPerfil);
