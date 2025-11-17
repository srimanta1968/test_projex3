import { Pool, PoolConfig } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

/**
 * PostgreSQL connection pool configuration
 */
const poolConfig: PoolConfig = {
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  min: config.db.poolMin,
  max: config.db.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
};

/**
 * Create database connection pool
 */
export const pool = new Pool(poolConfig);

// Pool event handlers
pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Database pool error:', { error: err.message });
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

/**
 * Execute a query with automatic connection management
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result
 */
export const query = async <T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.debug('Query executed', {
      text: text.substring(0, 100),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });

    return result.rows as T[];
  } catch (error) {
    logger.error('Query failed:', {
      text: text.substring(0, 100),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * Remember to release the client when done!
 */
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

/**
 * Gracefully close the pool
 */
export const closePool = async (): Promise<void> => {
  logger.info('Closing database pool...');
  await pool.end();
  logger.info('Database pool closed');
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await closePool();
});

process.on('SIGINT', async () => {
  await closePool();
});
