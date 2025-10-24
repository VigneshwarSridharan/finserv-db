# Portfolio Management Database Schema

This directory contains the complete Drizzle ORM schema definitions for the Portfolio Management System, converted from the original PostgreSQL schema files.

## 📁 Directory Structure

```
db/
├── schema.ts              # Main export file - import from here
├── schemas/               # Individual schema files
│   ├── users.schema.ts
│   ├── brokers-securities.schema.ts
│   ├── banks-deposits.schema.ts
│   ├── assets.schema.ts
│   ├── portfolio.schema.ts
│   └── views.schema.ts
├── relations.ts           # Drizzle relations for type-safe joins
├── functions.sql          # Database functions and triggers (for migrations)
└── README.md             # This file
```

## 🚀 Quick Start

### Importing Schemas

```typescript
// Import everything from the main schema file
import * as schema from '@/db/schema';

// Or import specific tables
import { users, portfolioSummary } from '@/db/schema';

// Or import from specific schema files
import { brokers, securities } from '@/db/schemas/brokers-securities.schema';
```

### Using with Drizzle

```typescript
import { db } from '@/config/database';
import { users, portfolioSummary } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Query users
const allUsers = await db.select().from(users);

// Query with conditions
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));

// Insert data
const newUser = await db.insert(users).values({
  username: 'johndoe',
  email: 'john@example.com',
  password_hash: 'hashed_password',
  first_name: 'John',
  last_name: 'Doe'
});
```

## 📊 Schema Overview

### 1. Users Schema (`users.schema.ts`)

**Tables:**
- `users` - Core user authentication and information
- `userProfiles` - Extended KYC details (PAN, Aadhar, occupation, etc.)
- `userPreferences` - User settings (currency, timezone, notifications)

**Key Features:**
- CHECK constraints for risk profile and portfolio view enums
- Unique constraints on email, username, PAN, and Aadhar
- Automatic timestamp management

### 2. Brokers & Securities Schema (`brokers-securities.schema.ts`)

**Tables:**
- `brokers` - Broker master data
- `userBrokerAccounts` - User accounts with brokers
- `securities` - Securities master (stocks, bonds, mutual funds, ETFs)
- `securityPrices` - OHLCV price data
- `userSecurityHoldings` - Current holdings with **generated columns**
- `securityTransactions` - Buy/sell/dividend transactions

**Generated Columns:**
```typescript
// These columns are computed by PostgreSQL automatically
total_investment: decimal('total_investment', { precision: 15, scale: 2 })
  .generatedAlwaysAs(sql`quantity * average_price`)

current_value: decimal('current_value', { precision: 15, scale: 2 })
  .generatedAlwaysAs(sql`quantity * COALESCE(current_price, average_price)`)

unrealized_pnl: decimal('unrealized_pnl', { precision: 15, scale: 2 })
  .generatedAlwaysAs(sql`quantity * (COALESCE(current_price, average_price) - average_price)`)
```

### 3. Banks & Deposits Schema (`banks-deposits.schema.ts`)

**Tables:**
- `banks` - Bank master data
- `userBankAccounts` - User bank accounts
- `fixedDeposits` - FD tracking with maturity calculations
- `fdInterestPayments` - Interest payment history
- `recurringDeposits` - RD tracking
- `rdInstallments` - Monthly installment records
- `bankTransactions` - All deposit-related transactions

**Key Features:**
- Complex CHECK constraints for payment statuses
- Foreign key references between FDs/RDs and transactions
- Composite unique constraints

### 4. Assets Schema (`assets.schema.ts`)

**Tables:**
- `assetCategories` & `assetSubcategories` - Asset classification
- `userAssets` - Physical/digital asset tracking
- `assetValuations` - Historical valuations
- `assetTransactions` - Purchase/sale records
- `realEstateDetails` - Property-specific information
- `goldDetails` - Gold-specific attributes
- `assetPriceIndices` - Index-based valuation data

**Asset Types:**
- Precious metals (gold, silver)
- Real estate (residential, commercial, land)
- Commodities
- Collectibles

### 5. Portfolio Schema (`portfolio.schema.ts`)

**Tables:**
- `portfolioSummary` - Consolidated portfolio by asset type
- `portfolioPerformance` - Historical performance tracking
- `portfolioGoals` - Financial goals with progress
- `assetAllocationTargets` - Target vs actual allocation
- `portfolioAlerts` - Notification system
- `portfolioReports` - Generated reports with **JSONB**
- `userWatchlist` - Securities watchlist
- `portfolioTransactionsLog` - Audit trail with **JSONB metadata**

**JSONB Columns:**
```typescript
import { jsonb } from 'drizzle-orm/pg-core';

report_data: jsonb('report_data')
metadata: jsonb('metadata')
```

### 6. Views Schema (`views.schema.ts`)

**Views (Read-Only):**
- `vPortfolioOverview` - Complete portfolio summary
- `vSecurityHoldings` - Detailed holdings with calculations
- `vFixedDeposits` - FDs with maturity status
- `vRecurringDeposits` - RDs with progress tracking
- `vUserAssets` - Assets with performance metrics
- `vPortfolioPerformance` - Performance analytics
- `vAssetAllocation` - Allocation analysis
- `vUserWatchlist` - Watchlist with current prices
- `vRecentTransactions` - Recent transaction history
- `vSecurityTransactions` - Comprehensive transaction view with P&L

**Usage:**
```typescript
import { vPortfolioOverview, vSecurityHoldings } from '@/db/schema';

// Query views like regular tables
const portfolio = await db
  .select()
  .from(vPortfolioOverview)
  .where(eq(vPortfolioOverview.user_id, userId));
```

## 🔗 Relations

The `relations.ts` file defines all table relationships for type-safe joins:

```typescript
import { db } from '@/config/database';
import { users, userSecurityHoldings } from '@/db/schema';

// Type-safe relational query
const userWithHoldings = await db.query.users.findFirst({
  where: eq(users.user_id, 1),
  with: {
    securityHoldings: true,
    brokerAccounts: {
      with: {
        broker: true
      }
    }
  }
});
```

## 🔨 Database Functions & Triggers

The `functions.sql` file contains PostgreSQL functions and triggers that should be run as part of migrations:

### Key Functions:

1. **`update_updated_at_column()`**
   - Automatically updates `updated_at` timestamp on row updates
   - Applied to: users, user_profiles, brokers, securities, banks, etc.

2. **`calculate_portfolio_summary(user_id)`**
   - Calculates and updates portfolio summary for a user
   - Aggregates securities, FDs, RDs, and assets

3. **`update_security_holdings_after_transaction()`**
   - Automatically updates holdings after buy/sell transactions
   - Calculates new average price and quantity
   - Triggered after INSERT on security_transactions

4. **`log_portfolio_transaction()`**
   - Logs all transactions to portfolio_transactions_log
   - Creates audit trail

### Running Functions:

```sql
-- In PostgreSQL after migrations
SELECT calculate_portfolio_summary(1); -- Update summary for user 1
```

## 📝 Migrations

### Generate Migrations

```bash
yarn db:generate
```

This will:
1. Analyze schema changes
2. Generate SQL migration files in `/drizzle` folder
3. Include all table definitions, indexes, and constraints

### Apply Migrations

```bash
yarn db:migrate
```

### Manual Steps After Migration

1. **Run functions.sql** to create triggers and functions:
```bash
psql -d portfolio_management -f src/db/functions.sql
```

2. **Create views** (if not auto-created):
```bash
psql -d portfolio_management -f ../../schema/07_views.sql
```

## 💡 Usage Examples

### Complex Queries

```typescript
import { db } from '@/config/database';
import { 
  users, 
  portfolioSummary, 
  userSecurityHoldings,
  securities 
} from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';

// Get user portfolio with summary
const userPortfolio = await db
  .select({
    userId: users.user_id,
    userName: users.username,
    assetType: portfolioSummary.asset_type,
    currentValue: portfolioSummary.current_value,
    totalPnl: portfolioSummary.total_pnl
  })
  .from(users)
  .leftJoin(portfolioSummary, eq(users.user_id, portfolioSummary.user_id))
  .where(eq(users.user_id, 1));

// Get profitable holdings
const profitableHoldings = await db
  .select()
  .from(userSecurityHoldings)
  .where(and(
    eq(userSecurityHoldings.user_id, 1),
    gte(userSecurityHoldings.unrealized_pnl, '0')
  ));
```

### Transactions

```typescript
import { db } from '@/config/database';
import { users, userProfiles, userPreferences } from '@/db/schema';

// Create user with profile and preferences
await db.transaction(async (tx) => {
  const [newUser] = await tx.insert(users).values({
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'hashed',
    first_name: 'John',
    last_name: 'Doe'
  }).returning();

  await tx.insert(userProfiles).values({
    user_id: newUser.user_id,
    pan_number: 'ABCDE1234F',
    risk_profile: 'moderate'
  });

  await tx.insert(userPreferences).values({
    user_id: newUser.user_id,
    currency: 'INR',
    portfolio_view: 'consolidated'
  });
});
```

### Working with Views

```typescript
import { vSecurityHoldings, vPortfolioOverview } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Get detailed holdings for a user
const holdings = await db
  .select()
  .from(vSecurityHoldings)
  .where(eq(vSecurityHoldings.user_id, 1))
  .orderBy(desc(vSecurityHoldings.unrealized_pnl));

// Get portfolio overview
const overview = await db
  .select()
  .from(vPortfolioOverview)
  .where(eq(vPortfolioOverview.user_id, 1));
```

## 🎯 Type Safety

All schemas export TypeScript types:

```typescript
import type { 
  User, NewUser,
  Security, NewSecurity,
  PortfolioSummary, NewPortfolioSummary 
} from '@/db/schema';

// Use types in your code
const createUser = async (userData: NewUser): Promise<User> => {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
};
```

## 🔍 Drizzle Studio

Launch the visual database browser:

```bash
yarn db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can:
- Browse all tables and views
- Execute queries
- Inspect relationships
- View data

## ⚠️ Important Notes

1. **Generated Columns**: The `total_investment`, `current_value`, and `unrealized_pnl` columns in `userSecurityHoldings` are computed by PostgreSQL. Do not try to insert/update these directly.

2. **Triggers**: Database triggers automatically:
   - Update `updated_at` timestamps
   - Update holdings after transactions
   - Log portfolio transactions

3. **Views**: Views are read-only. Use the underlying tables for inserts/updates.

4. **JSONB Columns**: Use JSON objects directly:
   ```typescript
   await db.insert(portfolioReports).values({
     user_id: 1,
     report_type: 'monthly',
     report_data: { 
       summary: { profit: 1000 },
       details: [...]
     }
   });
   ```

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Original Schema Files](/schema/)

## 🤝 Contributing

When modifying schemas:
1. Update the appropriate schema file in `/schemas`
2. Run `yarn db:generate` to create migrations
3. Test migrations in development
4. Update this README if adding new features
5. Document any manual migration steps needed

