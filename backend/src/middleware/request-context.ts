import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { createContextLogger } from '../utils/logger';

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      id: string;
      logger: ReturnType<typeof createContextLogger>;
      startTime: number;
    }
  }
}

/**
 * Request context middleware
 * Generates unique request ID and creates a logger with context
 * 
 * This middleware:
 * - Generates a unique UUID for each request
 * - Creates a child logger with request context
 * - Tracks request start time for duration calculation
 * - Makes context available to all downstream handlers
 */
export function requestContext(req: Request, res: Response, next: NextFunction) {
  // Generate unique request ID
  req.id = randomUUID();
  
  // Track request start time
  req.startTime = Date.now();
  
  // Create context for logging
  const context: Record<string, any> = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
  };
  
  // Add user context if authenticated
  if ((req as any).user) {
    context.userId = (req as any).user.userId;
    context.userEmail = (req as any).user.email;
  }
  
  // Create child logger with context
  req.logger = createContextLogger(context);
  
  // Add request ID to response headers for tracking
  res.setHeader('X-Request-ID', req.id);
  
  next();
}

/**
 * Get request duration in milliseconds
 */
export function getRequestDuration(req: Request): number {
  return Date.now() - req.startTime;
}

