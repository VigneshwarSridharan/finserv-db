import CircuitBreaker from 'opossum';
import logger from './logger';

/**
 * Circuit breaker options
 */
export interface CircuitBreakerOptions {
  timeout?: number; // Time in ms before operation times out (default: 3000)
  errorThresholdPercentage?: number; // Error percentage to trip circuit (default: 50)
  resetTimeout?: number; // Time in ms before attempting to close circuit (default: 30000)
  rollingCountTimeout?: number; // Time window for stats (default: 10000)
  rollingCountBuckets?: number; // Number of buckets in time window (default: 10)
  name?: string; // Name for logging purposes
}

/**
 * Default circuit breaker options
 */
const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  timeout: 3000, // 3 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30 seconds
  rollingCountTimeout: 10000, // 10 seconds
  rollingCountBuckets: 10,
};

/**
 * Create a circuit breaker for an async function
 * 
 * @param fn - The async function to protect
 * @param options - Circuit breaker configuration
 * @returns Circuit breaker instance
 * 
 * @example
 * const dbQuery = createCircuitBreaker(
 *   async (query) => db.execute(query),
 *   { name: 'database', timeout: 5000 }
 * );
 * 
 * try {
 *   const result = await dbQuery.fire('SELECT * FROM users');
 * } catch (error) {
 *   // Handle circuit open or execution error
 * }
 */
export function createCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CircuitBreakerOptions = {}
): CircuitBreaker<Parameters<T>, ReturnType<T>> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const breaker = new CircuitBreaker(fn, config);

  const breakerName = config.name || 'unnamed';

  // Event listeners for monitoring
  breaker.on('open', () => {
    logger.warn(`Circuit breaker [${breakerName}] opened - too many failures`, {
      circuitBreaker: breakerName,
      stats: breaker.stats,
    });
  });

  breaker.on('halfOpen', () => {
    logger.info(`Circuit breaker [${breakerName}] half-open - testing service`, {
      circuitBreaker: breakerName,
    });
  });

  breaker.on('close', () => {
    logger.info(`Circuit breaker [${breakerName}] closed - service recovered`, {
      circuitBreaker: breakerName,
    });
  });

  breaker.on('timeout', () => {
    logger.warn(`Circuit breaker [${breakerName}] timeout`, {
      circuitBreaker: breakerName,
      timeout: config.timeout,
    });
  });

  breaker.on('reject', () => {
    logger.warn(`Circuit breaker [${breakerName}] rejected request - circuit is open`, {
      circuitBreaker: breakerName,
    });
  });

  breaker.on('failure', (error) => {
    logger.error(`Circuit breaker [${breakerName}] failure`, {
      circuitBreaker: breakerName,
      error: error.message,
    });
  });

  return breaker;
}

/**
 * Create a circuit breaker with a fallback function
 * 
 * @param fn - The async function to protect
 * @param fallback - Fallback function when circuit is open
 * @param options - Circuit breaker configuration
 * @returns Circuit breaker instance with fallback
 * 
 * @example
 * const getUser = createCircuitBreakerWithFallback(
 *   async (id) => db.select().from(users).where(eq(users.id, id)),
 *   async (id) => ({ id, name: 'Cache unavailable', cached: true }),
 *   { name: 'getUser' }
 * );
 */
export function createCircuitBreakerWithFallback<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  fallback: T,
  options: CircuitBreakerOptions = {}
): CircuitBreaker<Parameters<T>, ReturnType<T>> {
  const breaker = createCircuitBreaker(fn, options);
  breaker.fallback(fallback);
  
  breaker.on('fallback', (result) => {
    logger.info(`Circuit breaker [${options.name || 'unnamed'}] using fallback`, {
      circuitBreaker: options.name,
    });
  });

  return breaker;
}

/**
 * Get circuit breaker statistics
 * 
 * @param breaker - Circuit breaker instance
 * @returns Statistics object
 */
export function getCircuitBreakerStats(breaker: CircuitBreaker<any, any>) {
  const stats = breaker.stats;
  return {
    failures: stats.failures,
    successes: stats.successes,
    rejects: stats.rejects,
    timeouts: stats.timeouts,
    fires: stats.fires,
    latencyMean: stats.latencyMean,
    isOpen: breaker.opened,
    isClosed: breaker.closed,
    isHalfOpen: breaker.halfOpen,
  };
}

/**
 * Health check for circuit breaker
 * 
 * @param breaker - Circuit breaker instance
 * @returns Health status
 */
export function getCircuitBreakerHealth(breaker: CircuitBreaker<any, any>) {
  if (breaker.opened) {
    return { status: 'unhealthy', state: 'open' };
  }
  if (breaker.halfOpen) {
    return { status: 'degraded', state: 'half-open' };
  }
  return { status: 'healthy', state: 'closed' };
}

