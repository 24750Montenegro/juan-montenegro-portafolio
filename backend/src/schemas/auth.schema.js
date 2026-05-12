// Esquemas de validacion para las operaciones de autenticacion
import { z } from 'zod';

export const esquemaLogin = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
});

// El registro reutiliza las reglas del login y agrega el nombre
export const esquemaRegistro = esquemaLogin.extend({
  nombre: z.string().min(2, 'Nombre demasiado corto').max(80),
});
