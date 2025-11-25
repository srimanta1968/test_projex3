import { Pool, PoolConfig, QueryResult, QueryResultRow, PoolClient } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * PostgreSQL connection pool configuration
 */
const poolConfig: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

/**
 * PostgreSQL connection pool instance
 */
export const pool = new Pool(poolConfig);

// Log pool events
pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error:', err);
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

/**
 * Test database connection
 * @returns true if connection successful, false otherwise
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    logger.info('🔍 Testing PostgreSQL connection...', {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
    });

    const client = await pool.connect();

    const result = await client.query<{ server_time: Date; pg_version: string }>(
      'SELECT NOW() as server_time, version() as pg_version'
    );

    client.release();

    const { server_time, pg_version } = result.rows[0];
    const version = pg_version.split(' ')[1];

    logger.info('✅ Database connected successfully!', {
      serverTime: server_time,
      postgresVersion: version,
    });

    return true;
  } catch (error: any) {
    logger.error('❌ Database connection failed!', {
      error: error.message,
      code: error.code,
    });

    logger.info('🔧 Troubleshooting steps:');
    logger.info('   1. Check if PostgreSQL is running: docker ps');
    logger.info('   2. Start database if needed: docker-compose up -d');
    logger.info('   3. Verify .env has correct DB credentials');
    logger.info(`   4. Check DB_HOST=${env.DB_HOST}, DB_PORT=${env.DB_PORT}`);

    return false;
  }
}

/**
 * Execute a parameterized query
 * @param text - SQL query text
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    logger.debug('Query executed', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });

    return result;
  } catch (error: any) {
    logger.error('Query failed', {
      query: text.substring(0, 100),
      error: error.message,
      code: error.code,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * Remember to call client.release() when done!
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Execute a transaction with automatic rollback on error
 * @param callback - Function to execute within transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Closing database pool...');
  await pool.end();
  logger.info('Database pool closed');
});

export default pool;
