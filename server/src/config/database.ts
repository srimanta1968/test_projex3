import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export interface DataServiceContext {
  userId?: string;
}

export const dataService = {
  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  },

  async queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] || null;
  },

  async execute(sql: string, params: unknown[] = []): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rowCount || 0;
    } finally {
      client.release();
    }
  },
};

export { pool };
export default dataService;
