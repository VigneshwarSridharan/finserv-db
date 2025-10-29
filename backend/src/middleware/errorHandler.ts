import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { getRequestDuration } from './request-context';

/**
 * Base API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  timestamp: string;
  context?: Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'API_ERROR';
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.name = 'ApiError';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database Error - DB connection/query failures
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', context?: Record<string, any>) {
    super(500, message, 'DATABASE_ERROR', true, context);
    this.name = 'DatabaseError';
  }
}

/**
 * Validation Error - Input validation failures
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', context?: Record<string, any>) {
    super(400, message, 'VALIDATION_ERROR', true, context);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error - Auth/token issues
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(401, message, 'AUTHENTICATION_ERROR', true, context);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error - Permission issues
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(403, message, 'AUTHORIZATION_ERROR', true, context);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error - Resource not found
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(404, message, 'NOT_FOUND', true, context);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error - Duplicate resources
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists', context?: Record<string, any>) {
    super(409, message, 'CONFLICT', true, context);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error - Too many requests
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests', context?: Record<string, any>) {
    super(429, message, 'RATE_LIMIT_EXCEEDED', true, context);
    this.name = 'RateLimitError';
  }
}

/**
 * Service Unavailable Error - External service down
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable', context?: Record<string, any>) {
    super(503, message, 'SERVICE_UNAVAILABLE', true, context);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Classify error by type
 */
function classifyError(err: Error): ApiError {
  // Already an ApiError
  if (err instanceof ApiError) {
    return err;
  }

  // Database errors (PostgreSQL specific)
  if (err.message?.includes('connection') || err.message?.includes('ECONNREFUSED')) {
    return new DatabaseError('Database connection failed', { originalError: err.message });
  }

  if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
    return new ConflictError('Resource already exists', { originalError: err.message });
  }

  // JWT/Auth errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AuthenticationError('Invalid or expired token', { originalError: err.message });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return new ValidationError(err.message, { originalError: err.message });
  }

  // Default: Programming error (non-operational)
  return new ApiError(500, 'Internal server error', 'INTERNAL_ERROR', false, {
    originalError: err.message,
    errorType: err.name,
  });
}

/**
 * Global error handler middleware
 * Catches all errors and returns consistent JSON response
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Classify the error
  const error = classifyError(err);

  // Calculate request duration
  const duration = req.startTime ? getRequestDuration(req) : undefined;

  // Prepare log context
  const logContext = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    statusCode: error.statusCode,
    errorCode: error.code,
    errorType: error.name,
    isOperational: error.isOperational,
    duration,
    userId: (req as any).user?.userId,
    ...(error.context || {}),
  };

  // Log the error
  if (error.isOperational) {
    // Operational errors (expected errors) - log as warning
    logger.warn(error.message, {
      ...logContext,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } else {
    // Programming errors (unexpected errors) - log as error
    logger.error(error.message, {
      ...logContext,
      stack: error.stack,
      originalError: err,
    });
  }

  // Prevent sending response twice
  if (res.headersSent) {
    return next(err);
  }

  // Prepare error response
  const errorResponse: any = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      requestId: req.id,
      timestamp: error.timestamp,
    },
  };

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = error.context;
    errorResponse.error.stack = error.stack;
  }

  // Send error response
  res.status(error.statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  
  logger.warn('Route not found', {
    requestId: req.id,
    method: req.method,
    path: req.path,
  });

  res.status(404).json({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      requestId: req.id,
      timestamp: error.timestamp,
    },
  });
}
