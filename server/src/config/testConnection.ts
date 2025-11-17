import { pool } from './database';

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('Testing PostgreSQL connection...');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
    console.log(`  Database: ${process.env.DB_NAME || 'banking_portal_db'}`);
    console.log(`  User: ${process.env.DB_USER || 'postgres'}`);

    const client = await pool.connect();

    const result = await client.query(`
      SELECT
        NOW() as server_time,
        version() as pg_version,
        current_database() as database_name
    `);

    console.log('\nDatabase connected successfully!');
    console.log(`  Server time: ${result.rows[0].server_time}`);
    console.log(`  PostgreSQL: ${result.rows[0].pg_version.split(' ')[1]}`);
    console.log(`  Database: ${result.rows[0].database_name}`);

    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log(`\nFound ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach((row) => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('\nNo tables found in public schema.');
      console.log('Run database migrations to create tables.');
    }

    client.release();
    return true;
  } catch (error: unknown) {
    console.error('\nDatabase connection failed!');
    if (error instanceof Error) {
      console.error(`  Error: ${error.message}`);
    }
    console.error('\nTroubleshooting:');
    console.error('  1. Check if PostgreSQL is running: docker ps');
    console.error('  2. Verify .env file exists and has correct DB credentials');
    console.error('  3. Check DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    console.error('  4. If using Docker, run: docker compose up -d');
    return false;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  testDatabaseConnection()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
