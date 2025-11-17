# Actionable Instructions - Banking Portal Financial Dashboard

## Analysis Summary

### Project Type: STARTUP PROJECT (No Existing Code)

**No existing TypeScript files found** - This is a new project requiring complete foundation setup.

### Context
- **Project:** Banking Portal - Financial Dashboard Overview
- **Sprint:** Sprint1 (Nov 3 - Nov 28, 2025)
- **Tech Stack:**
  - Backend: Express.js + TypeScript + PostgreSQL
  - Frontend: React + TypeScript + Tailwind CSS
  - Testing: Jest + Playwright

### Database Schemas (EXISTING - DO NOT RECREATE)
Located at `.projexlight/schemas/user-defined-schemas.sql`:
- `user` - User accounts with authentication fields
- `user_session` - Session management
- `password_reset` - Password reset tokens
- `email_verification` - Email verification tokens
- `audit_log` - Activity logging
- `bank_account` - User bank accounts
- `transaction_category` - Transaction categories
- `transaction` - Financial transactions
- `budget` - Budget tracking
- `financial_report` - Generated reports
- `alert` - User alerts
- `forecast` - Financial forecasts
- `dashboard_metric` - Dashboard metrics

---

## Task 0: Project Foundation & Authentication Setup

### Sub-task 1: Initialize Project Configuration

#### Files to Create:

**1. Root package.json**
**File:** `package.json`
```json
{
  "name": "banking-portal",
  "version": "1.0.0",
  "description": "Banking Portal - Financial Dashboard",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "npm run build:server && npm run build:client",
    "build:server": "cd server && npm run build",
    "build:client": "cd client && npm run build",
    "test": "npm run test:server && npm run test:client",
    "test:server": "cd server && npm test",
    "test:client": "cd client && npm test",
    "lint": "npm run lint:server && npm run lint:client",
    "lint:server": "cd server && npm run lint",
    "lint:client": "cd client && npm run lint"
  },
  "keywords": ["banking", "financial", "dashboard"],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**2. Server package.json**
**File:** `server/package.json`
```json
{
  "name": "banking-portal-server",
  "version": "1.0.0",
  "description": "Banking Portal API Server",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "winston": "^3.11.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/pg": "^8.10.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/uuid": "^9.0.7",
    "@types/node": "^20.10.4",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2"
  }
}
```

**3. Client package.json**
**File:** `client/package.json`
```json
{
  "name": "banking-portal-client",
  "version": "1.0.0",
  "description": "Banking Portal Frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "axios": "^1.6.2",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "jest-environment-jsdom": "^29.7.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

**4. Server tsconfig.json**
**File:** `server/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**5. Client tsconfig.json**
**File:** `client/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**6. Environment Variables Template**
**File:** `.env.example`
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banking_portal
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=24h

# Client Configuration
CLIENT_URL=http://localhost:5173

# API Configuration
API_PREFIX=/api
```

**7. Git Ignore File**
**File:** `.gitignore`
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Testing
coverage/
.nyc_output/

# IDE
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# TypeScript
*.tsbuildinfo
```

**8. Docker Compose for PostgreSQL**
**File:** `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: banking_portal_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: banking_portal
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**9. Database Initialization Script**
**File:** `init-scripts/01-schema.sql`
Copy entire contents from `.projexlight/schemas/user-defined-schemas.sql`

---

### Sub-task 2: Express Server Entry Point

**1. Environment Configuration**
**File:** `server/src/config/env.ts`
```typescript
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
  DB_NAME: process.env.DB_NAME || 'banking_portal',
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
    console.warn(`⚠️  Warning: Using default values for: ${missingVars.join(', ')}`);
    console.warn('   Please update .env file for production use.');
  }
}
```

**2. Logger Utility**
**File:** `server/src/utils/logger.ts`
```typescript
import winston from 'winston';
import { env } from '../config/env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
  ],
});

if (env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}

export default logger;
```

**3. Custom Error Classes**
**File:** `server/src/utils/errors.ts`
```typescript
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string>;

  constructor(message: string = 'Validation failed', errors: Record<string, string> = {}) {
    super(message, 422);
    this.errors = errors;
  }
}
```

**4. Error Handler Middleware**
**File:** `server/src/middleware/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { env } from '../config/env';

interface ErrorResponse {
  status: string;
  message: string;
  errors?: Record<string, string>;
  stack?: string;
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string> | undefined;

  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  if (err.stack && env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  const response: ErrorResponse = {
    status: 'error',
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
}
```

**5. Validation Middleware**
**File:** `server/src/middleware/validation.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: Record<string, string> = {};
    errors.array().forEach((err) => {
      if (err.type === 'field') {
        extractedErrors[err.path] = err.msg;
      }
    });

    next(new ValidationError('Validation failed', extractedErrors));
  };
};
```

**6. Express App Setup**
**File:** `server/src/app.ts`
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import logger from './utils/logger';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use(`${env.API_PREFIX}/auth`, authRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

logger.info(`App configured with API prefix: ${env.API_PREFIX}`);

export default app;
```

**7. Server Entry Point**
**File:** `server/src/server.ts`
```typescript
import app from './app';
import { env, validateEnv } from './config/env';
import { testDatabaseConnection } from './config/testConnection';
import logger from './utils/logger';

async function startServer(): Promise<void> {
  try {
    // Validate environment variables
    validateEnv();
    logger.info('Environment variables validated');

    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info('🚀 Server started successfully!');
      logger.info(`   Listening on: http://localhost:${env.PORT}`);
      logger.info(`   Environment: ${env.NODE_ENV}`);
      logger.info(`   Database: Connected`);
      logger.info(`   API Prefix: ${env.API_PREFIX}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

---

### Sub-task 3: PostgreSQL Database Connection

**1. Database Connection Pool**
**File:** `server/src/config/database.ts`
```typescript
import { Pool, PoolConfig } from 'pg';
import { env } from './env';
import logger from '../utils/logger';

const dbConfig: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

export const pool = new Pool(dbConfig);

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Closing database pool...');
  pool.end().then(() => {
    logger.info('Database pool closed');
  });
});

export default pool;
```

**2. Database Connection Test**
**File:** `server/src/config/testConnection.ts`
```typescript
import { pool } from './database';
import logger from '../utils/logger';

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    logger.info('🔍 Testing PostgreSQL connection...');
    const client = await pool.connect();

    const result = await client.query(
      'SELECT NOW() as server_time, version() as pg_version'
    );

    const { server_time, pg_version } = result.rows[0];
    const pgVersionShort = pg_version.split(' ')[1];

    logger.info('✅ Database connected successfully!');
    logger.info(`   Server time: ${server_time}`);
    logger.info(`   PostgreSQL: ${pgVersionShort}`);

    client.release();
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('❌ Database connection failed!');
    logger.error(`   Error: ${errorMessage}`);
    logger.error('🔧 Troubleshooting:');
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
```

---

### Sub-task 4: User Model and Authentication System

**1. User Model**
**File:** `server/src/models/User.ts`
```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  status: string;
  password_hash: string;
  email_verified: boolean;
  email_verified_at?: Date;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  preferences?: Record<string, unknown>;
  last_login_at?: Date;
  last_login_ip?: string;
  failed_login_attempts: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    status: user.status,
    email_verified: user.email_verified,
    two_factor_enabled: user.two_factor_enabled,
    created_at: user.created_at,
  };
}
```

**2. Password Utilities**
**File:** `server/src/utils/password.ts`
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if passwords match
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: 'Password is strong' };
}
```

**3. JWT Utilities**
**File:** `server/src/utils/jwt.ts`
```typescript
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT token for a user
 * @param userId - User ID
 * @param email - User email
 * @returns JWT token string
 */
export function generateToken(userId: string, email: string): string {
  const payload: TokenPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded token payload
 * @throws UnauthorizedError if token is invalid
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
```

**4. Auth Service**
**File:** `server/src/services/AuthService.ts`
```typescript
import { pool } from '../config/database';
import { User, UserDTO, CreateUserDTO, LoginDTO, AuthResponse, toUserDTO } from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

export class AuthService {
  /**
   * Register a new user
   * @param data - User registration data
   * @returns Auth response with user and token
   */
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.message);
    }

    // Check if email already exists
    const existingEmail = await pool.query(
      'SELECT id FROM "user" WHERE email = $1',
      [data.email]
    );
    if (existingEmail.rows.length > 0) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await pool.query(
      'SELECT id FROM "user" WHERE username = $1',
      [data.username]
    );
    if (existingUsername.rows.length > 0) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Insert user
    const result = await pool.query<User>(
      `INSERT INTO "user" (
        email, username, first_name, last_name, password_hash, phone, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [data.email, data.username, data.first_name, data.last_name, passwordHash, data.phone || null, 'active']
    );

    const user = result.rows[0];
    logger.info(`New user registered: ${user.email}`);

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
      user: toUserDTO(user),
      token,
    };
  }

  /**
   * Authenticate a user
   * @param data - Login credentials
   * @returns Auth response with user and token
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const result = await pool.query<User>(
      'SELECT * FROM "user" WHERE email = $1',
      [data.email]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new UnauthorizedError('Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed login attempts
      await pool.query(
        `UPDATE "user"
         SET failed_login_attempts = failed_login_attempts + 1,
             locked_until = CASE
               WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
               ELSE locked_until
             END,
             updated_at = NOW()
         WHERE id = $1`,
        [user.id]
      );
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset failed attempts and update last login
    await pool.query(
      `UPDATE "user"
       SET failed_login_attempts = 0,
           locked_until = NULL,
           last_login_at = NOW(),
           last_login_ip = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id, null] // IP address would come from request
    );

    logger.info(`User logged in: ${user.email}`);

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
      user: toUserDTO(user),
      token,
    };
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User DTO
   */
  async getUserById(userId: string): Promise<UserDTO> {
    const result = await pool.query<User>(
      'SELECT * FROM "user" WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    return toUserDTO(result.rows[0]);
  }
}

export const authService = new AuthService();
```

**5. Auth Middleware**
**File:** `server/src/middleware/authMiddleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, TokenPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { authService } from '../services/AuthService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      userId?: string;
    }
  }
}

/**
 * Middleware to protect routes requiring authentication
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = verifyToken(token);

    // Verify user still exists
    await authService.getUserById(decoded.userId);

    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
      req.userId = decoded.userId;
    }

    next();
  } catch {
    // Continue without auth
    next();
  }
}
```

**6. Auth Routes**
**File:** `server/src/routes/authRoutes.ts`
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/AuthService';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validate(registerValidation),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post(
  '/login',
  validate(loginValidation),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getUserById(req.userId!);
      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

---

### Sub-task 5: React App Structure

**1. Vite Configuration**
**File:** `client/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

**2. Tailwind Configuration**
**File:** `client/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};
```

**3. PostCSS Configuration**
**File:** `client/postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**4. Index HTML**
**File:** `client/index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Banking Portal - Financial Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**5. Main Entry Point**
**File:** `client/src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**6. Global Styles**
**File:** `client/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}
```

**7. App Component with Routing**
**File:** `client/src/App.tsx`
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

**8. Protected Route Component**
**File:** `client/src/components/ProtectedRoute.tsx`
```typescript
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
```

---

### Sub-task 6: Login and Register Pages

**1. API Service**
**File:** `client/src/services/api.ts`
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**2. Auth Service (Frontend)**
**File:** `client/src/services/authService.ts`
```typescript
import api from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  status: string;
  email_verified: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async getMe(): Promise<{ status: string; data: { user: User } }> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
```

**3. Auth Context**
**File:** `client/src/context/AuthContext.tsx`
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data.user);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const { user: userData, token: authToken } = response.data;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(authToken);
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    const { user: userData, token: authToken } = response.data;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**4. Login Page**
**File:** `client/src/pages/Login.tsx`
```typescript
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Banking Portal</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field mt-1"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-1"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
```

**5. Register Page**
**File:** `client/src/pages/Register.tsx`
```typescript
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        phone: formData.phone || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string; errors?: Record<string, string> }>;
      if (axiosError.response?.data?.errors) {
        const errorMessages = Object.values(axiosError.response.data.errors).join(', ');
        setError(errorMessages);
      } else {
        setError(axiosError.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Join the Banking Portal</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="johndoe123"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Min 8 chars, uppercase, number, special char"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
```

**6. Dashboard Page (Basic)**
**File:** `client/src/pages/Dashboard.tsx`
```typescript
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Banking Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Dashboard</h2>
          <p className="text-gray-600">
            Your financial dashboard is being set up. Stay tuned for:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>Real-time balance overview</li>
            <li>Income vs Expenses charts</li>
            <li>Net worth calculations</li>
            <li>Transaction history</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
```

---

### Sub-task 7: Testing Framework Configuration

**1. Server Jest Configuration**
**File:** `server/jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
```

**2. Server Test Setup**
**File:** `server/src/__tests__/setup.ts`
```typescript
import { pool } from '../config/database';

afterAll(async () => {
  await pool.end();
});
```

**3. Client Jest Configuration**
**File:** `client/jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

**4. Client Test Setup**
**File:** `client/src/__tests__/setup.ts`
```typescript
import '@testing-library/jest-dom';
```

---

## Execution Order

1. **Sub-task 1: Project Configuration** (no dependencies)
   - Create all package.json files
   - Create tsconfig.json files
   - Create .env.example
   - Create .gitignore
   - Create docker-compose.yml
   - Copy database schema to init-scripts/

2. **Sub-task 2: Express Server** (depends on sub-task 1)
   - Create config/env.ts
   - Create utils/logger.ts
   - Create utils/errors.ts
   - Create middleware/errorHandler.ts
   - Create middleware/validation.ts
   - Create app.ts
   - Create server.ts

3. **Sub-task 3: Database Connection** (depends on sub-task 1)
   - Create config/database.ts
   - Create config/testConnection.ts

4. **Sub-task 4: Auth System** (depends on sub-tasks 2, 3)
   - Create models/User.ts
   - Create utils/password.ts
   - Create utils/jwt.ts
   - Create services/AuthService.ts
   - Create middleware/authMiddleware.ts
   - Create routes/authRoutes.ts

5. **Sub-task 5: React Structure** (depends on sub-task 1)
   - Create vite.config.ts
   - Create tailwind.config.js
   - Create postcss.config.js
   - Create index.html
   - Create main.tsx
   - Create index.css
   - Create App.tsx
   - Create ProtectedRoute.tsx

6. **Sub-task 6: Login/Register Pages** (depends on sub-tasks 4, 5)
   - Create services/api.ts
   - Create services/authService.ts
   - Create context/AuthContext.tsx
   - Create pages/Login.tsx
   - Create pages/Register.tsx
   - Create pages/Dashboard.tsx

7. **Sub-task 7: Testing** (depends on sub-task 1)
   - Create server/jest.config.js
   - Create server/src/__tests__/setup.ts
   - Create client/jest.config.js
   - Create client/src/__tests__/setup.ts

8. **Sub-task 8: Validation** (depends on all above)
   - Install dependencies
   - Test database connection
   - Start server
   - Verify endpoints
   - Test frontend build

---

## Summary

This actionable instructions file provides complete, production-ready code for the Banking Portal foundation. All code includes:
- Full TypeScript types
- Error handling
- Input validation
- Security best practices (password hashing, JWT)
- Logging
- Environment configuration

The foundation is ready for Feature development (Tasks 1-5 from sprint context).
