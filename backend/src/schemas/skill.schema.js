// Esquemas de validacion para crear y actualizar conocimientos
import { z } from 'zod';

export const esquemaCrearConocimiento = z.object({
  nombre: z.string().trim().min(2).max(80),
  categoria: z.string().trim().max(60).optional().or(z.literal('')),
  descripcion: z.string().trim().max(2000).optional().or(z.literal('')),
  nivel: z.coerce.number().int().min(0).max(100).optional().default(0),
  orden: z.coerce.number().int().optional().default(0),
});

// Para actualizar todos los campos son opcionales
export const esquemaActualizarConocimiento = esquemaCrearConocimiento.partial();
