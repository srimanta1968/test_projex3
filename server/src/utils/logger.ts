import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, json } = winston.format;

const customFormat = printf(({ level, message, timestamp: ts, ...metadata }) => {
  let metaStr = '';
  if (Object.keys(metadata).length > 0) {
    metaStr = JSON.stringify(metadata);
  }
  return `${ts} [${level}]: ${message} ${metaStr}`;
});

const consoleFormat = env.isDevelopment
  ? combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat)
  : combine(timestamp(), json());

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

if (!env.isProduction) {
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
