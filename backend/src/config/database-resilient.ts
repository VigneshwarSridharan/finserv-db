import pRetry, { AbortError } from 'p-retry';
import { db, testConnection } from './database';
import { createCircuitBreaker, getCircuitBreakerHealth } from '../utils/circuit-breaker';
import { DatabaseError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Database operation retry configuration
 */
const RETRY_CONFIG = {
  retries: 3,
  factor: 2,
  minTimeout: 100,
  maxTimeout: 1000,
  randomize: true,
};

/**
 * Check if error is retriable (transient error)
 */
function isRetriableError(error: any): boolean {
  const retriablePatterns = [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'connection',
    'timeout',
    'deadlock',
    'lock timeout',
    'could not serialize',
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  return retriablePatterns.some(
    (pattern) =>
      errorMessage.includes(pattern.toLowerCase()) ||
      errorCode.includes(pattern.toLowerCase())
  );
}

/**
 * Check if error is a constraint violation (not retriable)
 */
function isConstraintError(error: any): boolean {
  const constraintPatterns = [
    'duplicate key',
    'unique constraint',
    'foreign key',
    'check constraint',
    'not null violation',
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  return constraintPatterns.some((pattern) => errorMessage.includes(pattern));
}

/**
 * Wrap database operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'database operation'
): Promise<T> {
  return pRetry(
    async () => {
      try {
        return await operation();
      } catch (error: any) {
        // Don't retry constraint violations
        if (isConstraintError(error)) {
          logger.debug(`Not retrying constraint error for ${operationName}`, {
            error: error.message,
          });
          throw new AbortError(error);
        }

        // Only retry transient errors
        if (!isRetriableError(error)) {
          logger.debug(`Not retrying non-transient error for ${operationName}`, {
            error: error.message,
          });
          throw new AbortError(error);
        }

        // Log retry attempt
        logger.warn(`Retrying ${operationName} due to transient error`, {
          error: error.message,
        });

        throw error;
      }
    },
    {
      ...RETRY_CONFIG,
      onFailedAttempt: (error: any) => {
        logger.warn(`Retry attempt ${error.attemptNumber} failed for ${operationName}`, {
          attemptsLeft: error.retriesLeft,
          error: error.message || String(error),
        });
      },
    }
  );
}

/**
 * Circuit breaker for database test connection
 */
const dbHealthCheckBreaker = createCircuitBreaker(
  async () => {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new DatabaseError('Database health check failed');
    }
    return isConnected;
  },
  {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    name: 'database-health-check',
  }
);

/**
 * Check database health with circuit breaker
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  circuitState: string;
  error?: string;
}> {
  try {
    await dbHealthCheckBreaker.fire();
    return {
      isHealthy: true,
      circuitState: 'closed',
    };
  } catch (error: any) {
    const health = getCircuitBreakerHealth(dbHealthCheckBreaker);
    return {
      isHealthy: false,
      circuitState: health.state,
      error: error.message,
    };
  }
}

/**
 * Execute database query with resilience (retry + circuit breaker)
 */
export async function executeWithResilience<T>(
  operation: () => Promise<T>,
  operationName: string = 'database query'
): Promise<T> {
  try {
    // First, check if circuit is open
    const health = getCircuitBreakerHealth(dbHealthCheckBreaker);
    if (health.status === 'unhealthy') {
      throw new DatabaseError('Database circuit breaker is open', {
        circuitState: health.state,
      });
    }

    // Execute with retry logic
    return await withRetry(operation, operationName);
  } catch (error: any) {
    logger.error(`Database operation failed: ${operationName}`, {
      error: error.message,
      stack: error.stack,
    });
    throw error instanceof DatabaseError ? error : new DatabaseError(error.message);
  }
}

/**
 * Wrapper for common database operations
 */
export const resilientDb = {
  /**
   * Select with resilience
   */
  async select<T>(operation: () => Promise<T>, operationName?: string): Promise<T> {
    return executeWithResilience(operation, operationName || 'select');
  },

  /**
   * Insert with resilience (no retry on constraint errors)
   */
  async insert<T>(operation: () => Promise<T>, operationName?: string): Promise<T> {
    return executeWithResilience(operation, operationName || 'insert');
  },

  /**
   * Update with resilience
   */
  async update<T>(operation: () => Promise<T>, operationName?: string): Promise<T> {
    return executeWithResilience(operation, operationName || 'update');
  },

  /**
   * Delete with resilience
   */
  async delete<T>(operation: () => Promise<T>, operationName?: string): Promise<T> {
    return executeWithResilience(operation, operationName || 'delete');
  },

  /**
   * Transaction with resilience
   */
  async transaction<T>(operation: () => Promise<T>, operationName?: string): Promise<T> {
    return executeWithResilience(operation, operationName || 'transaction');
  },
};

/**
 * Get database circuit breaker instance for health checks
 */
export function getDatabaseCircuitBreaker() {
  return dbHealthCheckBreaker;
}

// Export the original db for direct access when needed
export { db };

