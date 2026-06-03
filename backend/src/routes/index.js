// Enrutador principal que agrupa los modulos de la API
import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { projectRouter } from './project.routes.js';
import { skillRouter } from './skill.routes.js';
import { achievementRouter } from './achievement.routes.js';
import { reviewRouter } from './review.routes.js';

export const apiRouter = Router();

// Endpoint de salud para verificar que el servicio responde
apiRouter.get('/salud', (req, res) => res.json({ estado: 'ok' }));

apiRouter.use('/auth', authRouter);
apiRouter.use('/proyectos', projectRouter);
apiRouter.use('/conocimientos', skillRouter);
apiRouter.use('/logros', achievementRouter);
apiRouter.use('/resenas', reviewRouter);
