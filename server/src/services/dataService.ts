import { Pool, QueryResult } from 'pg';
import { databaseConfig } from '../config/database';

export interface QueryOptions {
  text: string;
  values?: any[];
}

export class DataService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(databaseConfig);

    // Handle connection errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  /**
   * Execute a query with optional parameters
   */
  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      return await client.query(text, values);
    } finally {
      client.release();
    }
  }

  /**
   * Execute a query with tenant context
   * Note: This project doesn't seem to have multi-tenant setup yet
   */
  async queryTenant<T = any>(text: string, values?: any[], context?: any): Promise<QueryResult<T>> {
    // For now, just execute the query
    // In a multi-tenant setup, you'd add tenant filtering here
    return this.query(text, values);
  }

  /**
   * Get a client for transactions
   */
  async getClient() {
    return await this.pool.connect();
  }

  /**
   * Close the pool
   */
  async close() {
    await this.pool.end();
  }
}

// Singleton instance
export const dataService = new DataService();
