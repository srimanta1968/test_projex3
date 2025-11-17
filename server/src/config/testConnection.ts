import { pool } from './database';
import { logger } from '../utils/logger';

/**
 * Test database connection
 * @returns true if connection successful, false otherwise
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    logger.info('🔍 Testing PostgreSQL connection...');

    const client = await pool.connect();

    const result = await client.query(`
      SELECT
        NOW() as server_time,
        version() as pg_version,
        current_database() as database_name,
        current_user as connected_user
    `);

    const { server_time, pg_version, database_name, connected_user } = result.rows[0];

    logger.info('✅ Database connected successfully!');
    logger.info(`   Server time: ${server_time}`);
    logger.info(`   PostgreSQL: ${pg_version.split(' ')[1]}`);
    logger.info(`   Database: ${database_name}`);
    logger.info(`   User: ${connected_user}`);

    // Check if required tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);

    if (tables.length > 0) {
      logger.info(`   Tables found: ${tables.join(', ')}`);
    } else {
      logger.warn('   No tables found in public schema. Run database migrations.');
    }

    client.release();
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as { code?: string }).code || 'UNKNOWN';

    logger.error('❌ Database connection failed!');
    logger.error(`   Error: ${errorMessage}`);
    logger.error(`   Code: ${errorCode}`);
    logger.error('');
    logger.error('🔧 Troubleshooting:');
    logger.error('   1. Check if PostgreSQL is running: docker ps');
    logger.error('   2. Start database: docker compose up -d');
    logger.error('   3. Verify .env file exists and has correct DB credentials');
    logger.error('   4. Check DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');

    if (errorCode === 'ECONNREFUSED') {
      logger.error('   5. Database server is not accepting connections');
    } else if (errorCode === '28P01') {
      logger.error('   5. Invalid password - check DB_PASSWORD in .env');
    } else if (errorCode === '3D000') {
      logger.error('   5. Database does not exist - check DB_NAME in .env');
    }

    return false;
  }
}

// Allow running this file directly for testing
if (require.main === module) {
  testDatabaseConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}
