# Migration to asyncHandler Pattern

## Current Status

✅ **Core error handling infrastructure is complete and working:**
- Winston logging
- Error classification
- Circuit breakers
- Request tracing
- Process-level handlers
- Enhanced health checks

✅ **Auth controller is migrated** to use asyncHandler pattern

⚠️ **Remaining 26 controllers** use the old try-catch pattern, but **this is OK!**

## Why Existing Controllers Work Fine

The current pattern in most controllers:

```typescript
export async function someHandler(req, res) {
  try {
    // ... logic
    res.json({ success: true, data });
  } catch (error) {
    throw error;  // ← This gets caught by Express error middleware
  }
}
```

**This works perfectly** with our new error handling system because:
1. The `throw error` sends the error to our global error handler
2. Our error handler classifies, logs, and formats the error properly
3. The application doesn't crash

## Benefits of Migrating to asyncHandler

The asyncHandler pattern:

```typescript
export const someHandler = asyncHandler(async (req, res) => {
  // ... logic (no try-catch needed)
  res.json({ success: true, data });
});
```

**Benefits:**
- Less boilerplate code
- Cleaner, more readable
- Automatic error forwarding
- Type-safe

**But migration is NOT urgent** - both patterns work equally well with our error handling system.

## How to Migrate (When Ready)

### Step 1: One Controller at a Time

Pick a controller to migrate (start with simple ones):

**Before:**
```typescript
import { Response } from 'express';
import { db } from '../config/database';

export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const users = await db.select().from(users);
    res.json({ success: true, data: users });
  } catch (error) {
    throw error;
  }
}
```

**After:**
```typescript
import { Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../utils/async-handler';

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await db.select().from(users);
  res.json({ success: true, data: users });
});
```

###Step 2: Update Error Throws to Use Specific Classes

**Before:**
```typescript
if (!user) {
  throw new ApiError(404, 'User not found');
}

if (existingEmail) {
  throw new ApiError(409, 'Email already exists');
}
```

**After:**
```typescript
import { NotFoundError, ConflictError } from '../middleware/errorHandler';

if (!user) {
  throw new NotFoundError('User not found');
}

if (existingEmail) {
  throw new ConflictError('Email already exists', { email: userData.email });
}
```

### Step 3: Test

After migrating a controller:
1. Test all endpoints in that controller
2. Verify errors are still caught and formatted properly
3. Check logs to ensure structured logging works

## Migration Priority (Suggested Order)

### Low Priority (Simple CRUD)
These have basic error handling and benefit least from migration:
- asset-categories.controller.ts
- banks.controller.ts  
- brokers.controller.ts

### Medium Priority (Business Logic)
These have some complex logic:
- assets.controller.ts
- bank-accounts.controller.ts
- securities.controller.ts
- portfolio.controller.ts

### High Priority (Complex / Critical)
These handle money, transactions, or complex flows:
- security-transactions.controller.ts
- bank-transactions.controller.ts
- fixed-deposits.controller.ts
- portfolio-overview.controller.ts

## Example: Full Controller Migration

Here's a complete before/after for reference:

### Before (brokers.controller.ts)
```typescript
import { Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { brokers } from '../db/schema';
import { ApiError } from '../middleware/errorHandler';

export async function listBrokers(req: Request, res: Response) {
  try {
    const allBrokers = await db.select().from(brokers);
    res.json({ success: true, data: allBrokers });
  } catch (error) {
    throw error;
  }
}

export async function getBrokerById(req: Request, res: Response) {
  try {
    const brokerId = parseInt(req.params.id);
    
    if (isNaN(brokerId)) {
      throw new ApiError(400, 'Invalid broker ID');
    }

    const broker = await db.select()
      .from(brokers)
      .where(eq(brokers.broker_id, brokerId))
      .limit(1);

    if (broker.length === 0) {
      throw new ApiError(404, 'Broker not found');
    }

    res.json({ success: true, data: broker[0] });
  } catch (error) {
    throw error;
  }
}
```

### After (with asyncHandler and specific errors)
```typescript
import { Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { brokers } from '../db/schema';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/async-handler';

export const listBrokers = asyncHandler(async (req: Request, res: Response) => {
  const allBrokers = await db.select().from(brokers);
  res.json({ success: true, data: allBrokers });
});

export const getBrokerById = asyncHandler(async (req: Request, res: Response) => {
  const brokerId = parseInt(req.params.id);
  
  if (isNaN(brokerId)) {
    throw new ValidationError('Invalid broker ID', { provided: req.params.id });
  }

  const broker = await db.select()
    .from(brokers)
    .where(eq(brokers.broker_id, brokerId))
    .limit(1);

  if (broker.length === 0) {
    throw new NotFoundError('Broker not found', { brokerId });
  }

  res.json({ success: true, data: broker[0] });
});
```

**Changes made:**
1. ✅ Imported `asyncHandler` and specific error classes
2. ✅ Changed `export async function` to `export const ... = asyncHandler`
3. ✅ Removed all try-catch blocks
4. ✅ Changed `ApiError(400, ...)` to `ValidationError(...)`
5. ✅ Changed `ApiError(404, ...)` to `NotFoundError(...)`
6. ✅ Added context objects to errors

## Testing Checklist

After migrating each controller:

- [ ] All endpoints return expected responses
- [ ] Validation errors return 400 with proper format
- [ ] Not found errors return 404
- [ ] Authentication errors return 401
- [ ] Server doesn't crash on errors
- [ ] Errors are logged with requestId
- [ ] Health check endpoint shows system status

## Gradual Migration Strategy

**Recommended approach:**
1. ✅ Keep existing controllers as-is (they work fine!)
2. ✅ Use asyncHandler for all NEW endpoints
3. 📅 Migrate existing controllers during feature updates
4. 📅 Full migration when time permits (not urgent)

## Summary

- **Current system works perfectly** - no urgent need to migrate
- **asyncHandler is cleaner** - but migration can be gradual
- **Migration is safe** - both patterns use same error handling
- **Start with simple controllers** - build confidence before complex ones
- **Test thoroughly** - after each controller migration

The error handling infrastructure is complete and production-ready. Controller migration is optional cleanup that can happen gradually.

