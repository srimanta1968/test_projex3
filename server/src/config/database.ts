import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

/**
 * Database connection pool configuration
 */
const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  min: config.database.poolMin,
  max: config.database.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

/**
 * PostgreSQL connection pool instance
 */
export const pool = new Pool(poolConfig);

// Log pool events
pool.on('connect', () => {
  logger.debug('New client connected to database pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', { error: err.message });
});

pool.on('remove', () => {
  logger.debug('Client removed from database pool');
});

/**
 * Execute a database query with parameters
 * @param text SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', {
      text: text.substring(0, 100),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
    return result;
  } catch (error) {
    logger.error('Query error', {
      text: text.substring(0, 100),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns Pool client
 */
export async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Override release to log duration
  let released = false;
  client.release = () => {
    if (released) {
      logger.warn('Client already released');
      return;
    }
    released = true;
    return originalRelease();
  };

  // Wrap query to handle types properly
  client.query = ((...args: unknown[]) => {
    return originalQuery(...(args as Parameters<typeof originalQuery>));
  }) as typeof client.query;

  return client;
}

/**
 * Graceful shutdown - close all pool connections
 */
export async function closePool(): Promise<void> {
  logger.info('Closing database pool...');
  await pool.end();
  logger.info('Database pool closed');
}

// Graceful shutdown on process termination
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);

export default pool;
