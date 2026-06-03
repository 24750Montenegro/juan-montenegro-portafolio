// Esquema de validacion para crear resenas
import { z } from 'zod';

export const esquemaCrearResena = z.object({
  nombre: z.string().trim().min(2).max(80),
  calificacion: z.coerce.number().int().min(1).max(5),
  comentario: z.string().trim().min(3).max(1000),
});
