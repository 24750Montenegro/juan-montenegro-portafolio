// Carga y valida las variables de entorno requeridas por la API
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Esquema que describe todas las variables de entorno esperadas
const esquemaEnv = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME es obligatoria'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY es obligatoria'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET es obligatoria'),
  // Supabase Storage para el PDF del portafolio (opcional hasta usarlo)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  SUPABASE_BUCKET: z.string().default('portafolio'),
});

const resultado = esquemaEnv.safeParse(process.env);

// Si falta o es invalida alguna variable, se aborta el arranque
if (!resultado.success) {
  console.error('Variables de entorno invalidas:', resultado.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = resultado.data;
