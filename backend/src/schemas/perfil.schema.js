// Esquema de validacion para actualizar el perfil
import { z } from 'zod';

// URL opcional: acepta una URL valida o cadena vacia
const urlOpcional = z.string().trim().max(500).url('URL invalida').optional().or(z.literal(''));

export const esquemaActualizarPerfil = z.object({
  email: z.string().trim().email('Email invalido').max(160).optional().or(z.literal('')),
  githubUrl: urlOpcional,
  linkedinUrl: urlOpcional,
});
