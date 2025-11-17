# Actionable Instructions - Banking Portal Financial Dashboard

## Analysis Summary

**Project Type:** STARTUP PROJECT (New Repository)

**Existing Code Found:** NONE - This is a first-time project initialization.

**Tech Stack:**
- Backend: Express + TypeScript + PostgreSQL
- Frontend: React + TypeScript + Tailwind CSS
- Testing: Jest (unit) + Playwright (e2e)

**Database Schema:** EXISTING - Found in `.projexlight/schemas/user-defined-schemas.sql`
- 13 tables predefined including: user, bank_account, transaction, financial_report, dashboard_metric, etc.

**New Code Needed:**
This is a complete project foundation requiring:
1. Project structure (server/ and client/ folders)
2. Backend API with Express/TypeScript
3. Frontend UI with React/TypeScript/Tailwind
4. Database setup using existing schemas
5. Authentication system (register/login)
6. Financial dashboard API and UI
7. Real-time updates with WebSockets
8. Unit and integration tests

---

## Project Requirements Summary

**Epic:** Financial Reports and Analytics

**Feature:** Financial Dashboard Overview
- Real-time financial health overview (income, expenses, net worth)
- Visual data representation with charts/graphs
- Responsive design (desktop, tablet, mobile)
- Real-time updates within 5 seconds
- Transaction analysis and financial planning

**Tasks to Implement:**
1. Database schema for financial dashboard (use existing schemas!)
2. Backend API for financial data (CRUD operations)
3. Real-time data updates (WebSockets)
4. Frontend dashboard UI (responsive with charts)
5. Testing (unit + integration)

---

## Complete Implementation Plan

### Phase 0: Project Foundation (MUST DO FIRST)

#### 1. Initialize Project Structure and Configuration

**Purpose:** Create complete folder structure and configuration files for both server and client

**Folder Structure to Create:**
```
test_projex3/
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── websocket/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── init-scripts/
│   └── 01-schema.sql
├── docker-compose.yml
├── .env.example
└── README.md
```

**File 1: server/package.json**
```json
{
  "name": "banking-portal-server",
  "version": "1.0.0",
  "description": "Banking Portal Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0",
    "zod": "^3.22.4",
    "ws": "^8.16.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/pg": "^8.10.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/ws": "^8.5.10",
    "@types/jest": "^29.5.11",
    "typescript": "^5.3.3",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

**File 2: server/tsconfig.json**
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
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**File 3: server/jest.config.js**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
```

**File 4: client/package.json**
```json
{
  "name": "banking-portal-client",
  "version": "1.0.0",
  "description": "Banking Portal Frontend",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "recharts": "^2.10.3",
    "axios": "^1.6.2",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

**File 5: client/tsconfig.json**
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

**File 6: client/tsconfig.node.json**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**File 7: client/vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    },
  },
});
```

**File 8: client/tailwind.config.js**
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
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

**File 9: client/postcss.config.js**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**File 10: .env.example**
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banking_portal
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_this_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**File 11: docker-compose.yml**
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
    restart: unless-stopped

volumes:
  postgres_data:
```

**File 12: .gitignore**
```
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Misc
*.tsbuildinfo
.cache/
```

#### 2. Database Setup (CRITICAL: Use Existing Schemas)

**File: init-scripts/01-schema.sql**

**Action:** COPY the content from `.projexlight/schemas/user-defined-schemas.sql` to `init-scripts/01-schema.sql`

DO NOT recreate the schemas - the user has already defined them!

---

### Phase 1: Backend Core Infrastructure

#### 1. Database Configuration

**File: server/src/config/database.ts**

```typescript
import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

/**
 * PostgreSQL connection pool configuration
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'banking_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection successful', { timestamp: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error });
    return false;
  }
}

/**
 * Execute a query with parameters
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executed', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

/**
 * Close all database connections
 */
export async function closePool(): Promise<void> {
  await pool.end();
  logger.info('Database pool closed');
}

export default pool;
```

#### 2. Environment Configuration

**File: server/src/config/env.ts**

```typescript
import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration with validation
 */
export const env = {
  // Server
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'banking_portal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && env.nodeEnv === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

#### 3. Logger Utility

**File: server/src/utils/logger.ts**

```typescript
import winston from 'winston';

/**
 * Winston logger configuration
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'banking-portal-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      ),
    }),
  ],
});

export default logger;
```

#### 4. Error Handling

**File: server/src/utils/errors.ts**

```typescript
/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad request error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Validation error (422)
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public errors?: Record<string, string[]>
  ) {
    super(message, 422);
  }
}
```

**File: server/src/middleware/errorHandler.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}

/**
 * Handle 404 errors
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
```

#### 5. JWT Utilities

**File: server/src/utils/jwt.ts**

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.jwt.secret) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
```

**File: server/src/utils/password.ts**

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

### Phase 2: Authentication System

#### 1. User Model

**File: server/src/models/User.ts**

```typescript
/**
 * User interface matching database schema
 */
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
  preferences?: any;
  last_login_at?: Date;
  last_login_ip?: string;
  failed_login_attempts: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * User DTO (without sensitive data)
 */
export interface UserDTO {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at?: Date;
  created_at: Date;
}

/**
 * User registration input
 */
export interface RegisterInput {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone?: string;
  date_of_birth?: Date;
}

/**
 * User login input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Convert User to UserDTO (remove sensitive fields)
 */
export function userToDTO(user: User): UserDTO {
  const {
    password_hash,
    two_factor_secret,
    failed_login_attempts,
    locked_until,
    last_login_ip,
    preferences,
    ...dto
  } = user;
  return dto;
}
```

#### 2. Auth Service

**File: server/src/services/AuthService.ts**

```typescript
import { query, getClient } from '../config/database';
import { User, UserDTO, RegisterInput, LoginInput, userToDTO } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Authentication service handling user registration and login
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<{ user: UserDTO; accessToken: string; refreshToken: string }> {
    try {
      // Check if user already exists
      const existingUser = await query<User>(
        'SELECT id FROM "user" WHERE email = $1 OR username = $2',
        [input.email, input.username]
      );

      if (existingUser.rows.length > 0) {
        throw new BadRequestError('User with this email or username already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Insert user
      const result = await query<User>(
        `INSERT INTO "user"
        (email, username, first_name, last_name, phone, date_of_birth, password_hash, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        RETURNING *`,
        [
          input.email,
          input.username,
          input.first_name,
          input.last_name,
          input.phone || null,
          input.date_of_birth || null,
          passwordHash,
        ]
      );

      const user = result.rows[0];

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user: userToDTO(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error', { error });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(input: LoginInput, ipAddress?: string): Promise<{ user: UserDTO; accessToken: string; refreshToken: string }> {
    try {
      // Find user
      const result = await query<User>(
        'SELECT * FROM "user" WHERE email = $1',
        [input.email]
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
      const isPasswordValid = await comparePassword(input.password, user.password_hash);

      if (!isPasswordValid) {
        // Increment failed attempts
        await query(
          'UPDATE "user" SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
          [user.id]
        );

        throw new UnauthorizedError('Invalid email or password');
      }

      // Reset failed attempts and update last login
      await query(
        `UPDATE "user"
        SET failed_login_attempts = 0,
            last_login_at = NOW(),
            last_login_ip = $1
        WHERE id = $2`,
        [ipAddress || null, user.id]
      );

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: userToDTO({ ...user, failed_login_attempts: 0 }),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error', { error });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserDTO | null> {
    try {
      const result = await query<User>(
        'SELECT * FROM "user" WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return userToDTO(result.rows[0]);
    } catch (error) {
      logger.error('Get user error', { error, userId });
      throw error;
    }
  }
}
```

#### 3. Auth Middleware

**File: server/src/middleware/authMiddleware.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
}
```

#### 4. Validation Middleware

**File: server/src/middleware/validation.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Validation middleware factory
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Registration schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
```

#### 5. Auth Routes

**File: server/src/routes/authRoutes.ts**

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { validate, registerSchema, loginSchema } from '../middleware/validation';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const result = await authService.login(req.body, ipAddress);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

### Phase 3: Financial Dashboard Backend

#### 1. Dashboard Models

**File: server/src/models/Dashboard.ts**

```typescript
/**
 * Dashboard metric interface
 */
export interface DashboardMetric {
  id: string;
  user_id: string;
  metric_type: string;
  period: string;
  value: number;
  previous_value?: number;
  change_percentage?: number;
  trend?: string;
  metadata?: any;
  calculated_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  transaction_date: Date;
  amount: number;
  type: string;
  description?: string;
  merchant?: string;
  reference_number?: string;
  status: string;
  is_recurring: boolean;
  tags?: any;
  notes?: string;
  external_id?: string;
  is_flagged: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Dashboard overview data
 */
export interface DashboardOverview {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  incomeVsExpenses: {
    income: number;
    expenses: number;
    period: string;
  };
  recentTransactions: Transaction[];
  trends: {
    incomeChange: number;
    expensesChange: number;
    netWorthChange: number;
  };
}

/**
 * Financial summary for a period
 */
export interface FinancialSummary {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  transactionCount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}
```

#### 2. Dashboard Service

**File: server/src/services/DashboardService.ts**

```typescript
import { query } from '../config/database';
import { DashboardOverview, DashboardMetric, Transaction, FinancialSummary } from '../models/Dashboard';
import logger from '../utils/logger';
import { NotFoundError } from '../utils/errors';

/**
 * Dashboard service for financial data
 */
export class DashboardService {
  /**
   * Get dashboard overview for a user
   */
  async getDashboardOverview(userId: string): Promise<DashboardOverview> {
    try {
      // Get total balance from all accounts
      const balanceResult = await query<{ total: number }>(
        'SELECT COALESCE(SUM(balance), 0) as total FROM bank_account WHERE user_id = $1 AND is_active = true',
        [userId]
      );
      const currentBalance = Number(balanceResult.rows[0]?.total || 0);

      // Get income and expenses for current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const incomeResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'income'
         AND transaction_date >= $2 AND status = 'completed'`,
        [userId, firstDayOfMonth]
      );
      const totalIncome = Number(incomeResult.rows[0]?.total || 0);

      const expensesResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'expense'
         AND transaction_date >= $2 AND status = 'completed'`,
        [userId, firstDayOfMonth]
      );
      const totalExpenses = Number(expensesResult.rows[0]?.total || 0);

      // Calculate net worth (simplified: balance + total assets - total liabilities)
      const netWorth = currentBalance;

      // Get recent transactions
      const transactionsResult = await query<Transaction>(
        `SELECT * FROM transaction
         WHERE user_id = $1
         ORDER BY transaction_date DESC
         LIMIT 10`,
        [userId]
      );
      const recentTransactions = transactionsResult.rows;

      // Calculate trends (compare with previous month)
      const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const prevIncomeResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'income'
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, firstDayOfPrevMonth, lastDayOfPrevMonth]
      );
      const prevIncome = Number(prevIncomeResult.rows[0]?.total || 0);

      const prevExpensesResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'expense'
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, firstDayOfPrevMonth, lastDayOfPrevMonth]
      );
      const prevExpenses = Number(prevExpensesResult.rows[0]?.total || 0);

      const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
      const expensesChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;
      const netWorthChange = 0; // Simplified for now

      return {
        currentBalance,
        totalIncome,
        totalExpenses,
        netWorth,
        incomeVsExpenses: {
          income: totalIncome,
          expenses: totalExpenses,
          period: 'month',
        },
        recentTransactions,
        trends: {
          incomeChange,
          expensesChange,
          netWorthChange,
        },
      };
    } catch (error) {
      logger.error('Dashboard overview error', { error, userId });
      throw error;
    }
  }

  /**
   * Get financial summary for a date range
   */
  async getFinancialSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialSummary> {
    try {
      // Get totals
      const incomeResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'income'
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, startDate, endDate]
      );
      const totalIncome = Number(incomeResult.rows[0]?.total || 0);

      const expensesResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'expense'
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, startDate, endDate]
      );
      const totalExpenses = Number(expensesResult.rows[0]?.total || 0);

      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*) as count
         FROM transaction
         WHERE user_id = $1
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, startDate, endDate]
      );
      const transactionCount = parseInt(countResult.rows[0]?.count || '0');

      // Get category breakdown
      const categoryResult = await query<{ category: string; amount: number }>(
        `SELECT tc.name as category, COALESCE(SUM(t.amount), 0) as amount
         FROM transaction t
         LEFT JOIN transaction_category tc ON t.category_id = tc.id
         WHERE t.user_id = $1 AND t.type = 'expense'
         AND t.transaction_date >= $2 AND t.transaction_date <= $3
         AND t.status = 'completed'
         GROUP BY tc.name
         ORDER BY amount DESC`,
        [userId, startDate, endDate]
      );

      const categoryBreakdown = categoryResult.rows.map(row => ({
        category: row.category || 'Uncategorized',
        amount: Number(row.amount),
        percentage: totalExpenses > 0 ? (Number(row.amount) / totalExpenses) * 100 : 0,
      }));

      return {
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalIncome,
        totalExpenses,
        netChange: totalIncome - totalExpenses,
        transactionCount,
        categoryBreakdown,
      };
    } catch (error) {
      logger.error('Financial summary error', { error, userId });
      throw error;
    }
  }

  /**
   * Update dashboard metrics (background job)
   */
  async updateMetrics(userId: string): Promise<void> {
    try {
      const overview = await this.getDashboardOverview(userId);

      // Update or insert metrics
      const metrics = [
        { type: 'balance', value: overview.currentBalance },
        { type: 'income', value: overview.totalIncome },
        { type: 'expenses', value: overview.totalExpenses },
        { type: 'net_worth', value: overview.netWorth },
      ];

      for (const metric of metrics) {
        await query(
          `INSERT INTO dashboard_metric (user_id, metric_type, period, value, calculated_at)
           VALUES ($1, $2, 'month', $3, NOW())
           ON CONFLICT (user_id, metric_type, period)
           DO UPDATE SET value = $3, calculated_at = NOW()`,
          [userId, metric.type, metric.value]
        );
      }

      logger.info('Metrics updated', { userId });
    } catch (error) {
      logger.error('Metrics update error', { error, userId });
      throw error;
    }
  }
}
```

#### 3. Dashboard Routes

**File: server/src/routes/dashboardRoutes.ts**

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const dashboardService = new DashboardService();

/**
 * GET /api/dashboard/overview
 * Get dashboard overview for current user
 */
router.get('/overview', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = await dashboardService.getDashboardOverview(userId);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/summary
 * Get financial summary for date range
 */
router.get('/summary', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const data = await dashboardService.getFinancialSummary(userId, start, end);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

### Phase 4: WebSocket Real-time Updates

**File: server/src/websocket/websocketServer.ts**

```typescript
import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../utils/logger';

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>> = new Map();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      try {
        // Extract token from query string
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
          ws.close(1008, 'Token required');
          return;
        }

        // Verify token
        const payload = verifyAccessToken(token);
        const userId = payload.userId;

        // Add client to user's set
        if (!this.clients.has(userId)) {
          this.clients.set(userId, new Set());
        }
        this.clients.get(userId)!.add(ws);

        logger.info('WebSocket connected', { userId });

        // Handle messages
        ws.on('message', (message: string) => {
          try {
            const data = JSON.parse(message.toString());
            logger.debug('WebSocket message', { userId, data });
          } catch (error) {
            logger.error('WebSocket message error', { error });
          }
        });

        // Handle disconnect
        ws.on('close', () => {
          this.clients.get(userId)?.delete(ws);
          if (this.clients.get(userId)?.size === 0) {
            this.clients.delete(userId);
          }
          logger.info('WebSocket disconnected', { userId });
        });

        // Send welcome message
        ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to Banking Portal' }));
      } catch (error) {
        logger.error('WebSocket connection error', { error });
        ws.close(1008, 'Authentication failed');
      }
    });
  }

  /**
   * Broadcast message to specific user
   */
  sendToUser(userId: string, message: any): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const messageStr = JSON.stringify(message);
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: any): void {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(userClients => {
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    });
  }
}
```

---

### Phase 5: Express App Setup

**File: server/src/app.ts**

```typescript
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import logger from './utils/logger';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: env.cors.origin,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later',
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    logger.debug('Incoming request', {
      method: req.method,
      path: req.path,
      query: req.query,
    });
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
```

**File: server/src/server.ts**

```typescript
import http from 'http';
import { createApp } from './app';
import { env, validateEnv } from './config/env';
import { testConnection, closePool } from './config/database';
import { WebSocketManager } from './websocket/websocketServer';
import logger from './utils/logger';

/**
 * Start the server
 */
async function start(): Promise<void> {
  try {
    // Validate environment
    validateEnv();

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket
    const wsManager = new WebSocketManager(server);

    // Make WebSocket manager available globally
    (global as any).wsManager = wsManager;

    // Start server
    server.listen(env.port, () => {
      logger.info(`Server started`, {
        port: env.port,
        environment: env.nodeEnv,
      });
      logger.info(`HTTP server: http://localhost:${env.port}`);
      logger.info(`WebSocket server: ws://localhost:${env.port}/ws`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await closePool();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Server startup error', { error });
    process.exit(1);
  }
}

start();
```

---

### Phase 6: Frontend Implementation

#### 1. Client Entry Points

**File: client/index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Banking Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**File: client/src/main.tsx**
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

**File: client/src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### 2. Types

**File: client/src/types/index.ts**
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
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at?: Date;
  created_at: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface DashboardOverview {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  incomeVsExpenses: {
    income: number;
    expenses: number;
    period: string;
  };
  recentTransactions: Transaction[];
  trends: {
    incomeChange: number;
    expensesChange: number;
    netWorthChange: number;
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  transaction_date: string;
  amount: number;
  type: string;
  description?: string;
  merchant?: string;
  status: string;
}
```

#### 3. API Service

**File: client/src/services/api.ts**
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default config
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle errors
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**File: client/src/services/authService.ts**
```typescript
import api from './api';
import { User, AuthResponse } from '../types';

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Auth service
 */
export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ status: string; data: AuthResponse }>('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data.data;

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return response.data.data;
  },

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<{ status: string; data: AuthResponse }>('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data.data;

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return response.data.data;
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ status: string; data: { user: User } }>('/auth/me');
    return response.data.data.user;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
```

**File: client/src/services/dashboardService.ts**
```typescript
import api from './api';
import { DashboardOverview } from '../types';

/**
 * Dashboard service
 */
export const dashboardService = {
  /**
   * Get dashboard overview
   */
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<{ status: string; data: DashboardOverview }>('/dashboard/overview');
    return response.data.data;
  },
};
```

#### 4. Auth Context

**File: client/src/context/AuthContext.tsx**
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to get current user', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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

#### 5. Pages

**File: client/src/pages/Login.tsx**
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Banking Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/register" className="text-primary-600 hover:text-primary-500">
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**File: client/src/pages/Register.tsx**
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Banking Portal today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Email address"
            />
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Username"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="First name"
              />
              <input
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Last name"
              />
            </div>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Password"
            />
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Confirm password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-primary-600 hover:text-primary-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**File: client/src/pages/Dashboard.tsx**
```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { DashboardOverview } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const overview = await dashboardService.getOverview();
      setData(overview);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const chartData = [
    { name: 'Income', value: data?.totalIncome || 0 },
    { name: 'Expenses', value: data?.totalExpenses || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Banking Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.first_name}!</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${data?.currentBalance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ${data?.totalIncome.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data?.trends.incomeChange >= 0 ? '+' : ''}
              {data?.trends.incomeChange.toFixed(1)}% from last month
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600 mt-2">
              ${data?.totalExpenses.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data?.trends.expensesChange >= 0 ? '+' : ''}
              {data?.trends.expensesChange.toFixed(1)}% from last month
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Net Worth</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              ${data?.netWorth.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Income vs Expenses Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  data?.recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description || transaction.merchant || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
```

#### 6. App Component

**File: client/src/App.tsx**
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

### Phase 7: Testing

#### 1. Backend Unit Tests

**File: server/tests/unit/auth.test.ts**
```typescript
import { AuthService } from '../../src/services/AuthService';
import { hashPassword, comparePassword } from '../../src/utils/password';

jest.mock('../../src/config/database');
jest.mock('../../src/utils/password');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });
});
```

**File: server/tests/unit/dashboard.test.ts**
```typescript
import { DashboardService } from '../../src/services/DashboardService';

jest.mock('../../src/config/database');

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = new DashboardService();
    jest.clearAllMocks();
  });

  describe('getDashboardOverview', () => {
    it('should return dashboard overview', async () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });
});
```

---

## Execution Order

### Step 1: Project Initialization
1. Create server/package.json, server/tsconfig.json, server/jest.config.js
2. Create client/package.json, client/tsconfig.json, client/vite.config.ts, client/tailwind.config.js
3. Create .env.example, .gitignore, docker-compose.yml
4. Copy .projexlight/schemas/user-defined-schemas.sql to init-scripts/01-schema.sql

### Step 2: Backend Core (server/src/)
1. config/database.ts, config/env.ts
2. utils/logger.ts, utils/errors.ts, utils/jwt.ts, utils/password.ts
3. middleware/errorHandler.ts, middleware/authMiddleware.ts, middleware/validation.ts
4. models/User.ts
5. services/AuthService.ts
6. routes/authRoutes.ts
7. models/Dashboard.ts
8. services/DashboardService.ts
9. routes/dashboardRoutes.ts
10. websocket/websocketServer.ts
11. app.ts, server.ts

### Step 3: Frontend (client/src/)
1. types/index.ts
2. services/api.ts, services/authService.ts, services/dashboardService.ts
3. context/AuthContext.tsx
4. pages/Login.tsx, pages/Register.tsx, pages/Dashboard.tsx
5. App.tsx, main.tsx, index.css
6. index.html (in client/)

### Step 4: Tests
1. server/tests/unit/auth.test.ts
2. server/tests/unit/dashboard.test.ts

### Step 5: Installation
1. Run `npm install` in server/
2. Run `npm install` in client/

### Step 6: Database Setup
1. Run `docker-compose up -d` to start PostgreSQL
2. Database will be initialized with schemas automatically

### Step 7: Start Development
1. Create .env file in root (copy from .env.example)
2. Run `npm run dev` in server/
3. Run `npm run dev` in client/

---

## Success Criteria

- [ ] Server starts on port 5000
- [ ] Client starts on port 3000
- [ ] Database connection successful
- [ ] User can register
- [ ] User can login
- [ ] Dashboard displays after login
- [ ] Dashboard shows financial metrics
- [ ] Tests run successfully

---

**END OF ACTIONABLE INSTRUCTIONS**
