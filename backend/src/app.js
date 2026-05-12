// Configuracion de la aplicacion Express y su cadena de middlewares
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { noEncontrado, manejadorErrores } from './middlewares/error.middleware.js';

export const app = express();

// Solo se acepta el origen del cliente configurado en el entorno
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

// Manejo de rutas inexistentes y de errores al final de la cadena
app.use(noEncontrado);
app.use(manejadorErrores);
