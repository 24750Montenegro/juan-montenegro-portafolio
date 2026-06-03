// Almacenamiento de archivos en Supabase Storage (p.ej. el PDF del portafolio)
import axios from 'axios';
import { env } from '../config/env.js';

const error = (status, publico) => Object.assign(new Error(publico), { status, publico });

// Configuracion validada; falla claro si falta algo
const config = () => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw error(500, 'Almacenamiento de Supabase no configurado');
  }
  return {
    url: env.SUPABASE_URL.replace(/\/$/, ''),
    key: env.SUPABASE_SERVICE_KEY,
    bucket: env.SUPABASE_BUCKET,
  };
};

const cabeceras = (key, extra = {}) => ({ Authorization: `Bearer ${key}`, apikey: key, ...extra });

// Crea el bucket publico si aun no existe (idempotente)
const asegurarBucket = async ({ url, key, bucket }) => {
  try {
    await axios.post(
      `${url}/storage/v1/bucket`,
      { id: bucket, name: bucket, public: true },
      { headers: cabeceras(key, { 'Content-Type': 'application/json' }) },
    );
  } catch (e) {
    const codigo = e.response?.status;
    // Ya existe: se ignora
    if (codigo !== 400 && codigo !== 409) throw e;
  }
};

// Sube un archivo y devuelve { url (publica), path }
export const subirArchivo = async (buffer, ruta, contentType) => {
  const cfg = config();
  await asegurarBucket(cfg);
  await axios.post(`${cfg.url}/storage/v1/object/${cfg.bucket}/${ruta}`, buffer, {
    headers: cabeceras(cfg.key, { 'Content-Type': contentType, 'x-upsert': 'true' }),
  });
  return { url: `${cfg.url}/storage/v1/object/public/${cfg.bucket}/${ruta}`, path: ruta };
};

// Elimina un archivo por su ruta dentro del bucket
export const eliminarArchivo = async (ruta) => {
  if (!ruta) return;
  const cfg = config();
  try {
    await axios.delete(`${cfg.url}/storage/v1/object/${cfg.bucket}/${ruta}`, {
      headers: cabeceras(cfg.key),
    });
  } catch (e) {
    if (e.response?.status !== 404) throw e;
  }
};
