import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CLIENT_URL: string;
  API_PREFIX: string;
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'banking_portal_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  API_PREFIX: process.env.API_PREFIX || '/api',
};

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const requiredVars = ['JWT_SECRET', 'DB_PASSWORD'];
  const missingVars: string[] = [];

  requiredVars.forEach((varName) => {
    if (!process.env[varName] || process.env[varName]?.includes('your_')) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0 && env.NODE_ENV === 'production') {
    throw new Error(`Missing or invalid environment variables: ${missingVars.join(', ')}`);
  }

  if (missingVars.length > 0) {
    console.warn(`Warning: Using default values for: ${missingVars.join(', ')}`);
    console.warn('   Please update .env file for production use.');
  }
}
