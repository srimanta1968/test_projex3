import { pool } from './database';
import { logger } from '../utils/logger';

/**
 * Test database connection
 * @returns True if connection successful, false otherwise
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('Testing PostgreSQL connection...');

    const client = await pool.connect();

    const result = await client.query(`
      SELECT
        NOW() as server_time,
        version() as pg_version,
        current_database() as database_name,
        current_user as connected_user
    `);

    client.release();

    const { server_time, pg_version, database_name, connected_user } = result.rows[0];

    console.log('\n=================================');
    console.log('  Database Connection Test');
    console.log('=================================');
    console.log('  Status:    SUCCESS');
    console.log(`  Database:  ${database_name}`);
    console.log(`  User:      ${connected_user}`);
    console.log(`  Time:      ${server_time}`);
    console.log(`  Version:   ${pg_version.split(',')[0]}`);
    console.log('=================================\n');

    logger.info('Database connection test passed', {
      database: database_name,
      user: connected_user,
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('\n=================================');
    console.error('  Database Connection Test');
    console.error('=================================');
    console.error('  Status:    FAILED');
    console.error(`  Error:     ${errorMessage}`);
    console.error('=================================');
    console.error('\nTroubleshooting:');
    console.error('  1. Check if PostgreSQL is running');
    console.error('     - Docker: docker ps');
    console.error('     - Start: docker-compose up -d');
    console.error('  2. Verify .env file exists with correct credentials');
    console.error('  3. Check these environment variables:');
    console.error('     - DB_HOST (default: localhost)');
    console.error('     - DB_PORT (default: 5432)');
    console.error('     - DB_NAME (default: banking_portal_db)');
    console.error('     - DB_USER (default: postgres)');
    console.error('     - DB_PASSWORD');
    console.error('  4. Ensure database exists:');
    console.error('     - psql -U postgres -c "CREATE DATABASE banking_portal_db;"');
    console.error('=================================\n');

    logger.error('Database connection test failed', { error: errorMessage });

    return false;
  } finally {
    // Close the pool after testing
    await pool.end();
  }
}

// Run test if executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch(() => {
      process.exit(1);
    });
}
