import { Pool } from 'pg';
import { databaseConfig } from '../config/database';

const pool = new Pool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
  user: databaseConfig.user,
  password: databaseConfig.password,
  ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : false,
  min: databaseConfig.pool.min,
  max: databaseConfig.pool.max,
});

export interface QueryContext {
  userId?: string;
  groupUserId?: string;
}

/**
 * DataService provides centralized database access
 */
export const dataService = {
  /**
   * Execute a query with parameters
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const result = await pool.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  /**
   * Execute a query and return single row
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] || null;
  },

  /**
   * Execute a query with tenant context
   */
  async queryTenant<T = any>(
    sql: string,
    params: any[],
    context: QueryContext
  ): Promise<T[]> {
    try {
      const result = await pool.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Database tenant query error:', error);
      throw error;
    }
  },

  /**
   * Get the pool for transactions
   */
  getPool(): Pool {
    return pool;
  },
};

export default dataService;
