import { pool } from '../config/database';

beforeAll(async () => {
  // Setup test database connection
});

afterAll(async () => {
  await pool.end();
});
