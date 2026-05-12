// Enrutador principal que agrupa los modulos de la API
import { Router } from 'express';

export const apiRouter = Router();

// Endpoint de salud para verificar que el servicio responde
apiRouter.get('/salud', (req, res) => res.json({ estado: 'ok' }));
