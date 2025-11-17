import { Pool, PoolConfig } from 'pg';
import { env } from './env';
import logger from '../utils/logger';

const dbConfig: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

export const pool = new Pool(dbConfig);

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Closing database pool...');
  pool.end().then(() => {
    logger.info('Database pool closed');
  });
});

export default pool;
