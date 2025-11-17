import { Pool, PoolConfig } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = {
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: config.db.poolMax,
  min: config.db.poolMin,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

process.on('SIGTERM', () => {
  pool.end().then(() => {
    logger.info('Database pool closed on SIGTERM');
  });
});

process.on('SIGINT', () => {
  pool.end().then(() => {
    logger.info('Database pool closed on SIGINT');
  });
});
