import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';
import logger from '../utils/logger';

const poolConfig: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
};

export const pool = new Pool(poolConfig);

// Log pool events
pool.on('connect', () => {
  logger.debug('New client connected to database pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err.message });
});

pool.on('remove', () => {
  logger.debug('Client removed from database pool');
});

// Graceful shutdown
const shutdown = (): void => {
  logger.info('Closing database pool...');
  pool.end().then(() => {
    logger.info('Database pool closed');
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Query helper function
export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Query failed', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

// Transaction helper
export const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Set a timeout of 5 seconds for unused connections
  let lastQuery = Date.now();
  const timeout = setTimeout(() => {
    logger.warn('Client has been checked out for more than 5 seconds!');
  }, 5000);

  client.query = ((...args: Parameters<typeof originalQuery>) => {
    lastQuery = Date.now();
    return originalQuery(...args);
  }) as typeof client.query;

  client.release = () => {
    clearTimeout(timeout);
    const duration = Date.now() - lastQuery;
    logger.debug('Client released', { lastQueryDuration: `${duration}ms` });
    return originalRelease();
  };

  return client;
};

export default pool;
