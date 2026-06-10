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

// Enlaces adicionales: llegan como arreglo de objetos o como JSON (FormData).
// Cada enlace tiene etiqueta corta y URL http(s). Devuelve undefined si el
// campo no llego (para que las actualizaciones parciales no lo pisen).
const enlaces = z
  .union([z.array(z.unknown()), z.string()])
  .optional()
  .transform((valor) => {
    if (valor === undefined) return undefined;
    let lista = valor;
    if (typeof lista === 'string') {
      if (!lista.trim()) return [];
      try {
        lista = JSON.parse(lista);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(lista)) return [];
    return lista
      .filter((e) => e && typeof e.url === 'string' && /^https?:\/\//i.test(e.url.trim()))
      .slice(0, 10)
      .map((e) => ({
        etiqueta: String(e.etiqueta || '').trim().slice(0, 40) || 'LINK',
        url: e.url.trim().slice(0, 500),
      }));
  });

export const esquemaCrearProyecto = z.object({
  titulo: z.string().trim().min(2).max(120),
  descripcion: z.string().trim().min(10),
  repoUrl: urlOpcional,
  demoUrl: urlOpcional,
  enlaces,
  etiquetas,
  destacado: z.coerce.boolean().optional().default(false),
  orden: z.coerce.number().int().optional().default(0),
});

// Para actualizar todos los campos son opcionales
export const esquemaActualizarProyecto = esquemaCrearProyecto.partial();
