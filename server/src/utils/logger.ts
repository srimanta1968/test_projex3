import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  if (entry.data) {
    return `${base} ${JSON.stringify(entry.data)}`;
  }
  return base;
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };

  const formattedLog = formatLog(entry);

  if (level === 'error') {
    console.error(formattedLog);
  } else if (level === 'warn') {
    console.warn(formattedLog);
  } else if (level === 'debug' && env.NODE_ENV === 'development') {
    console.log(formattedLog);
  } else if (level === 'info') {
    console.log(formattedLog);
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log('debug', message, data),
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
};

export default logger;
