// Pool de conexiones a PostgreSQL reutilizado en toda la aplicacion
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Supabase y otros proveedores gestionados exigen conexion SSL
const requiereSsl = /supabase\.(co|com)|sslmode=require/.test(env.DATABASE_URL);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: requiereSsl ? { rejectUnauthorized: false } : false,
});

// Ejecuta una consulta parametrizada usando una conexion del pool
export const query = (texto, parametros) => pool.query(texto, parametros);
