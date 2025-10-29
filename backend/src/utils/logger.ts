import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config/env';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const isDevelopment = env.NODE_ENV === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Custom format for console output (pretty print in development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaString = '';
    
    // Format metadata
    if (Object.keys(meta).length > 0) {
      // Remove internal winston properties
      const cleanMeta = { ...meta };
      delete cleanMeta[Symbol.for('level')];
      delete cleanMeta[Symbol.for('message')];
      delete cleanMeta[Symbol.for('splat')];
      
      if (Object.keys(cleanMeta).length > 0) {
        metaString = '\n' + JSON.stringify(cleanMeta, null, 2);
      }
    }
    
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

// Custom format for file output (JSON for easy parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logs directory path
const logsDir = path.join(process.cwd(), 'logs');

// Define transports
const transports: winston.transport[] = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transports only if not in test environment
if (env.NODE_ENV !== 'test') {
  // Combined log (all levels) - rotated daily
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      format: fileFormat,
    })
  );

  // Error log (errors only) - rotated daily
  transports.push(
    new DailyRotateFile({
      level: 'error',
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d', // Keep error logs for 30 days
      format: fileFormat,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],
  // Exit on handled exceptions (we'll override this in production)
  exitOnError: false,
});

// Create a child logger with context
export function createContextLogger(context: Record<string, any>) {
  return logger.child(context);
}

// Export the default logger
export default logger;

// Helper methods for structured logging
export const log = {
  error: (message: string, meta?: Record<string, any>) => {
    logger.error(message, meta);
  },
  warn: (message: string, meta?: Record<string, any>) => {
    logger.warn(message, meta);
  },
  info: (message: string, meta?: Record<string, any>) => {
    logger.info(message, meta);
  },
  http: (message: string, meta?: Record<string, any>) => {
    logger.http(message, meta);
  },
  debug: (message: string, meta?: Record<string, any>) => {
    logger.debug(message, meta);
  },
};

