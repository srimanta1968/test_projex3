/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '@config/(.*)': '<rootDir>/src/config/$1',
    '@models/(.*)': '<rootDir>/src/models/$1',
    '@services/(.*)': '<rootDir>/src/services/$1',
    '@routes/(.*)': '<rootDir>/src/routes/$1',
    '@middleware/(.*)': '<rootDir>/src/middleware/$1',
    '@utils/(.*)': '<rootDir>/src/utils/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  verbose: true,
  testTimeout: 10000,
};
