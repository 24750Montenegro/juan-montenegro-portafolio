// Aplica el esquema SQL inicial a la base de datos configurada
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from '../config/db.js';

const directorioActual = dirname(fileURLToPath(import.meta.url));

// Lee schema.sql y lo ejecuta en una sola sentencia
async function migrar() {
  const sql = await readFile(join(directorioActual, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Esquema aplicado correctamente');
  await pool.end();
}

migrar().catch(async (error) => {
  console.error('Fallo la migracion:', error);
  await pool.end();
  process.exit(1);
});
