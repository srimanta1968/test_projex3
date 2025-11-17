import { pool } from './database';
import { logger } from '../utils/logger';

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    logger.info('Testing PostgreSQL connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as server_time, version() as pg_version');
    logger.info('Database connected successfully!', {
      serverTime: result.rows[0].server_time,
      pgVersion: result.rows[0].pg_version.split(' ')[1],
    });
    client.release();
    return true;
  } catch (error: any) {
    logger.error('Database connection failed!', {
      error: error.message,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    });
    console.error('Troubleshooting:');
    console.error('  1. Check if PostgreSQL is running: docker ps');
    console.error('  2. Verify .env file exists and has correct DB credentials');
    console.error('  3. Check DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    return false;
  }
}

if (require.main === module) {
  testDatabaseConnection()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
