import { Pool, PoolConfig } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = {
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  max: env.db.poolMax,
  min: env.db.poolMin,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
};

export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected database pool error', err);
});

pool.on('connect', () => {
  logger.debug('New database client connected');
});

/**
 * Test the database connection
 * @returns true if connection is successful, false otherwise
 */
export async function testDatabaseConnection(): Promise<boolean> {
  const client = await pool.connect().catch((err) => {
    logger.error('Failed to acquire database client', err);
    return null;
  });

  if (!client) {
    return false;
  }

  try {
    const result = await client.query('SELECT NOW() as server_time, version() as pg_version');
    const { server_time, pg_version } = result.rows[0];

    logger.info('Database connection successful', {
      serverTime: server_time,
      postgresVersion: pg_version.split(' ')[1],
    });

    return true;
  } catch (error) {
    logger.error('Database query failed', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Execute a query with parameters
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  logger.debug('Query executed', {
    query: text.substring(0, 100),
    duration: `${duration}ms`,
    rows: result.rowCount,
  });

  return { rows: result.rows as T[], rowCount: result.rowCount };
}

/**
 * Get a client from the pool for transaction support
 */
export async function getClient() {
  return pool.connect();
}

export default { pool, query, getClient, testDatabaseConnection };
