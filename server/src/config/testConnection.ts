import { pool } from './database';
import logger from '../utils/logger';

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    logger.info('Testing PostgreSQL connection...');
    const client = await pool.connect();

    const result = await client.query(
      'SELECT NOW() as server_time, version() as pg_version'
    );

    const { server_time, pg_version } = result.rows[0];
    const pgVersionShort = pg_version.split(' ')[1];

    logger.info('Database connected successfully!');
    logger.info(`   Server time: ${server_time}`);
    logger.info(`   PostgreSQL: ${pgVersionShort}`);

    client.release();
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Database connection failed!');
    logger.error(`   Error: ${errorMessage}`);
    logger.error('Troubleshooting:');
    logger.error('   1. Check if PostgreSQL is running: docker ps');
    logger.error('   2. Verify .env file exists and has correct DB credentials');
    logger.error('   3. Check DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    logger.error('   4. Run: docker compose up -d');
    return false;
  }
}

// Allow running this file directly for testing
if (require.main === module) {
  testDatabaseConnection()
    .then((connected) => {
      process.exit(connected ? 0 : 1);
    })
    .catch(() => {
      process.exit(1);
    });
}
