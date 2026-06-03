// Esquemas de validacion para crear y actualizar logros
import { z } from 'zod';

export const esquemaCrearLogro = z.object({
  titulo: z.string().trim().min(2).max(120),
  descripcion: z.string().trim().max(2000).optional().or(z.literal('')),
  fecha: z.string().trim().max(40).optional().or(z.literal('')),
  orden: z.coerce.number().int().optional().default(0),
});

// Para actualizar todos los campos son opcionales
export const esquemaActualizarLogro = esquemaCrearLogro.partial();
