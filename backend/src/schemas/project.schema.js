// Esquemas de validacion para crear y actualizar proyectos
import { z } from 'zod';

// URL opcional: acepta una URL valida o cadena vacia (formularios)
const urlOpcional = z
  .string()
  .trim()
  .max(500)
  .url('URL invalida')
  .optional()
  .or(z.literal(''));

// Las etiquetas pueden llegar como arreglo o como texto separado por comas
const etiquetas = z
  .union([z.array(z.string().max(40)), z.string()])
  .optional()
  .transform((valor) => {
    if (Array.isArray(valor)) return valor;
    if (!valor) return [];
    return valor.split(',').map((etiqueta) => etiqueta.trim()).filter(Boolean);
  });

export const esquemaCrearProyecto = z.object({
  titulo: z.string().trim().min(2).max(120),
  descripcion: z.string().trim().min(10),
  repoUrl: urlOpcional,
  demoUrl: urlOpcional,
  etiquetas,
  destacado: z.coerce.boolean().optional().default(false),
  orden: z.coerce.number().int().optional().default(0),
});

// Para actualizar todos los campos son opcionales
export const esquemaActualizarProyecto = esquemaCrearProyecto.partial();
