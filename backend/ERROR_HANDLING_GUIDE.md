# Comprehensive Error Handling Guide

## Overview

The backend has been equipped with production-grade error handling that ensures the application **never crashes** from errors. This guide explains the implementation and how to use it.

## Key Features

### ✅ What's Implemented

1. **Professional Logging** - Winston with file rotation and structured logs
2. **Error Classification** - 8 different error types with proper HTTP status codes
3. **Circuit Breakers** - Protect against cascade failures
4. **Automatic Retries** - Smart retry logic for transient failures
5. **Process-Level Handlers** - Catch uncaught exceptions and unhandled rejections
6. **Request Tracing** - Unique request IDs for debugging
7. **Graceful Shutdown** - Proper cleanup on server shutdown
8. **Enhanced Health Check** - Monitor system status and circuit breakers

### ❌ What's NOT Included

- **No Sentry** - No external monitoring services
- **No APM** - No application performance monitoring tools
- All monitoring is done through file-based logs and health endpoints

## Architecture

### Error Classes Hierarchy

```typescript
ApiError (base class)
├── DatabaseError (500)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
└── ServiceUnavailableError (503)
```

Each error includes:
- `statusCode`: HTTP status code
- `code`: Error code for frontend
- `isOperational`: Flag indicating if error is expected
- `context`: Additional error context
- `timestamp`: When error occurred

### Logging System

#### Log Levels
- **error**: Application errors, caught exceptions
- **warn**: Recoverable issues, operational errors
- **info**: Business operations, server events
- **http**: HTTP requests and responses
- **debug**: Detailed debugging info (dev only)

#### Log Files Location
```
backend/logs/
├── combined-2025-01-15.log    # All logs
├── error-2025-01-15.log        # Errors only
├── exceptions.log              # Uncaught exceptions
└── rejections.log              # Unhandled rejections
```

Logs rotate daily and are kept for:
- Combined logs: 14 days
- Error logs: 30 days

### Request Context

Every request automatically gets:
- **Request ID** (UUID v4) - For tracing across logs
- **Logger** - Child logger with context
- **Start Time** - For duration tracking

Request ID is returned in:
- Response header: `X-Request-ID`
- Error responses: `error.requestId`

## Usage Examples

### 1. Using Error Classes in Controllers

```typescript
import { asyncHandler } from '../utils/async-handler';
import { NotFoundError, ConflictError } from '../middleware/errorHandler';

export const getUser = asyncHandler(async (req, res) => {
  const user = await db.select().from(users).where(eq(users.id, req.params.id));
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json({ success: true, data: user });
});

export const createUser = asyncHandler(async (req, res) => {
  const existing = await db.select().from(users).where(eq(users.email, req.body.email));
  
  if (existing.length > 0) {
    throw new ConflictError('Email already exists', { email: req.body.email });
  }
  
  const user = await db.insert(users).values(req.body).returning();
  res.status(201).json({ success: true, data: user });
});
```

### 2. Logging with Context

```typescript
import logger from '../utils/logger';

// Simple logging
logger.info('User logged in', { userId: 123, email: 'user@example.com' });
logger.error('Payment failed', { orderId: 456, error: err.message });

// Using request logger (has request context)
export const someHandler = asyncHandler(async (req, res) => {
  req.logger.info('Processing order', { orderId: req.body.orderId });
  // This log will include requestId automatically
});
```

### 3. Database Operations with Resilience

```typescript
import { resilientDb } from '../config/database-resilient';

// Automatic retries for transient errors
export const getUsers = asyncHandler(async (req, res) => {
  const users = await resilientDb.select(
    () => db.select().from(users),
    'get-users'
  );
  
  res.json({ success: true, data: users });
});
```

### 4. Circuit Breaker for External Services

```typescript
import { createCircuitBreaker } from '../utils/circuit-breaker';

const fetchExternalAPI = createCircuitBreaker(
  async (userId) => {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    return response.json();
  },
  {
    name: 'external-api',
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

// Use it
export const getUserData = asyncHandler(async (req, res) => {
  try {
    const data = await fetchExternalAPI.fire(req.params.userId);
    res.json({ success: true, data });
  } catch (error) {
    // Circuit is open or request failed
    throw new ServiceUnavailableError('External service unavailable');
  }
});
```

## Error Response Format

All errors return a consistent JSON format:

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2025-01-15T10:30:45.123Z"
  }
}
```

In development mode, additional fields are included:
```json
{
  "error": {
    ...
    "details": { /* error context */ },
    "stack": "Error: ...\n  at ..."
  }
}
```

## Health Check Endpoint

Access `/health` to monitor system status:

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:45.123Z",
  "environment": "development",
  "uptime": "2h 15m 30s",
  "uptimeSeconds": 8130,
  "database": {
    "status": "connected",
    "circuitBreaker": {
      "state": "closed",
      "stats": {
        "successes": 1234,
        "failures": 5,
        "rejects": 0,
        "timeouts": 0,
        "latencyMean": 12
      }
    }
  },
  "memory": {
    "heapUsed": 45,
    "heapTotal": 78,
    "external": 2,
    "rss": 120
  },
  "node": {
    "version": "v18.17.0",
    "platform": "darwin",
    "arch": "arm64"
  }
}
```

## Environment Configuration

Add these to your `.env` file:

```bash
# Logging
LOG_LEVEL=info                    # error|warn|info|http|debug
LOG_DIR=./logs
ENABLE_FILE_LOGGING=true

# Database Resilience
DB_RETRY_ATTEMPTS=3
DB_CIRCUIT_BREAKER_THRESHOLD=5

# Server
GRACEFUL_SHUTDOWN_TIMEOUT=10000   # milliseconds
```

## Process-Level Error Handling

The server automatically handles:

1. **Uncaught Exceptions** - Logs error and attempts graceful shutdown
2. **Unhandled Rejections** - Logs error but doesn't crash
3. **Process Warnings** - Logs warnings for monitoring
4. **SIGTERM/SIGINT** - Graceful shutdown on kill signals

## Testing Error Handling

### Test 1: Unhandled Promise Rejection

Create a test endpoint:
```typescript
app.get('/test/rejection', (req, res) => {
  Promise.reject(new Error('Test rejection'));
  res.json({ message: 'Check logs' });
});
```

Result: Error logged, server continues running ✅

### Test 2: Database Connection Failure

Stop PostgreSQL and make a request:
```bash
docker stop postgres
curl http://localhost:3000/api/users
```

Result: 
- Automatic retries (3 attempts)
- Circuit breaker opens after threshold
- Error response returned
- Server continues running ✅

### Test 3: Validation Error

Send invalid data:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'
```

Result: 400 error with field-level validation details ✅

## Migration from Old Code

Old pattern:
```typescript
export async function handler(req, res) {
  try {
    const data = await someOperation();
    res.json({ success: true, data });
  } catch (error) {
    throw error;
  }
}
```

New pattern:
```typescript
export const handler = asyncHandler(async (req, res) => {
  const data = await someOperation();
  res.json({ success: true, data });
});
```

Benefits:
- No try-catch boilerplate
- Automatic error forwarding
- Type-safe
- Cleaner code

## Best Practices

### ✅ DO

1. **Use specific error classes**
   ```typescript
   throw new NotFoundError('Resource not found');
   throw new ValidationError('Invalid email format');
   ```

2. **Include context in errors**
   ```typescript
   throw new ConflictError('Email already exists', {
     email: userData.email,
     attemptedAt: new Date().toISOString()
   });
   ```

3. **Log important business events**
   ```typescript
   logger.info('Payment processed', { userId, amount, transactionId });
   ```

4. **Use asyncHandler for all route handlers**
   ```typescript
   export const myHandler = asyncHandler(async (req, res) => { ... });
   ```

### ❌ DON'T

1. **Don't use generic errors**
   ```typescript
   throw new Error('Something went wrong'); // ❌
   ```

2. **Don't swallow errors**
   ```typescript
   try {
     await operation();
   } catch (error) {
     console.log(error); // ❌ Don't just log and continue
   }
   ```

3. **Don't log sensitive data**
   ```typescript
   logger.info('User data', { password: user.password }); // ❌
   ```

4. **Don't use process.exit()**
   ```typescript
   if (error) process.exit(1); // ❌ Use graceful shutdown instead
   ```

## Monitoring in Production

1. **Check Health Endpoint**
   ```bash
   curl http://your-server/health
   ```

2. **Monitor Log Files**
   ```bash
   tail -f logs/error-*.log
   tail -f logs/combined-*.log | grep ERROR
   ```

3. **Watch Circuit Breakers**
   - If circuit is "open", service is degraded
   - If circuit is "half-open", service is recovering
   - If circuit is "closed", service is healthy

4. **Set Up Alerts** (manual monitoring)
   - Alert on circuit breaker opens
   - Alert on high error rates
   - Alert on memory/CPU spikes

## Troubleshooting

### Server Not Starting

Check logs:
```bash
cat logs/exceptions.log
cat logs/combined-*.log | grep ERROR
```

### Slow Responses

1. Check database circuit breaker state in `/health`
2. Check latency stats in health endpoint
3. Review logs for retry attempts

### Memory Leaks

Monitor memory in `/health` endpoint:
```bash
watch -n 5 'curl -s http://localhost:3000/health | jq .memory'
```

## Summary

This error handling system ensures:
- ✅ Application never crashes
- ✅ All errors are logged with context
- ✅ Transient failures are automatically retried
- ✅ Circuit breakers prevent cascade failures
- ✅ Request tracing for debugging
- ✅ Graceful shutdown and cleanup
- ✅ Production-ready monitoring

No external dependencies required!

