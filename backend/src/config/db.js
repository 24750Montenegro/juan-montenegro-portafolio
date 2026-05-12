// Pool de conexiones a PostgreSQL reutilizado en toda la aplicacion
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({ connectionString: env.DATABASE_URL });

// Ejecuta una consulta parametrizada usando una conexion del pool
export const query = (texto, parametros) => pool.query(texto, parametros);
