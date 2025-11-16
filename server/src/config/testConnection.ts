import { pool } from './database';

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing PostgreSQL connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as server_time, version() as pg_version');
    console.log('✅ Database connected successfully!');
    console.log(`   Server time: ${result.rows[0].server_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[1]}`);
    client.release();
    return true;
  } catch (error: unknown) {
    console.error('❌ Database connection failed!');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    }
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check if PostgreSQL is running');
    console.error('   2. Verify .env file exists and has correct DB credentials');
    console.error('   3. Check DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    return false;
  }
}

if (require.main === module) {
  testDatabaseConnection()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
