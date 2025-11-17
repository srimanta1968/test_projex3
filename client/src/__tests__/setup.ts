import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: 'http://localhost:5173',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000',
    VITE_WS_URL: 'http://localhost:3000',
  },
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Suppress React Router warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('React Router')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
