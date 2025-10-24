# Quick Start Guide - Drizzle ORM Schema

## 🚀 Get Started in 5 Minutes

### Prerequisites
- PostgreSQL 12+ running
- Node.js 18+ installed
- Database credentials ready

### Step 1: Setup Environment (30 seconds)

Create `.env` file:
```bash
cp env.example .env
```

Update with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_management
DB_USER=portfolio_user
DB_PASSWORD=your_password
DATABASE_URL=postgresql://portfolio_user:your_password@localhost:5432/portfolio_management
```

### Step 2: Install Dependencies (1 minute)

```bash
yarn install
```

### Step 3: Generate & Run Migrations (2 minutes)

```bash
# Generate migration files from schema
yarn db:generate

# Apply migrations to database
yarn db:push

# Apply generated columns
psql -d portfolio_management -f src/db/generated-columns.sql

# Apply database functions and triggers
psql -d portfolio_management -f src/db/functions.sql

# Apply views (from schema directory)
psql -d portfolio_management -f ../schema/07_views.sql
```

### Step 4: Verify Setup (30 seconds)

```bash
# Start the server
yarn dev

# You should see:
# ✅ Database connected successfully at: [timestamp]
# Server running on port 3000
```

### Step 5: Open Drizzle Studio (optional)

```bash
yarn db:studio
```

Opens at `https://local.drizzle.studio` - visual database browser.

---

## 📖 Basic Usage

### Import Schema

```typescript
// Import everything
import * as schema from '@/db/schema';

// Or import specific tables
import { users, portfolioSummary, securities } from '@/db/schema';
```

### Query Data

```typescript
import { db } from '@/config/database';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Get all users
const allUsers = await db.select().from(users);

// Get user by email
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));
```

### Insert Data

```typescript
const newUser = await db.insert(users).values({
  username: 'johndoe',
  email: 'john@example.com',
  password_hash: await bcrypt.hash('password', 10),
  first_name: 'John',
  last_name: 'Doe'
}).returning();
```

### Update Data

```typescript
await db
  .update(users)
  .set({ first_name: 'Jane' })
  .where(eq(users.user_id, 1));
```

### Delete Data

```typescript
await db
  .delete(users)
  .where(eq(users.user_id, 1));
```

### Join Tables

```typescript
import { users, portfolioSummary } from '@/db/schema';

const result = await db
  .select()
  .from(users)
  .leftJoin(portfolioSummary, eq(users.user_id, portfolioSummary.user_id))
  .where(eq(users.user_id, 1));
```

### Use Relations (Better!)

```typescript
const userWithPortfolio = await db.query.users.findFirst({
  where: eq(users.user_id, 1),
  with: {
    portfolioSummaries: true,
    securityHoldings: {
      with: {
        security: true
      }
    }
  }
});
```

### Use Views

```typescript
import { vPortfolioOverview, vSecurityHoldings } from '@/db/schema';

// Query view like a regular table
const overview = await db
  .select()
  .from(vPortfolioOverview)
  .where(eq(vPortfolioOverview.user_id, 1));
```

---

## 📊 Available Tables

| Schema | Tables | Description |
|--------|--------|-------------|
| **Users** | 3 | Authentication, profiles, preferences |
| **Brokers & Securities** | 6 | Brokers, securities, holdings, transactions |
| **Banks & Deposits** | 7 | Banks, FDs, RDs, transactions |
| **Assets** | 8 | Categories, assets, valuations, real estate, gold |
| **Portfolio** | 8 | Summary, performance, goals, reports, watchlist |
| **Views** | 10 | Read-only analytical views |

**Total: 32 tables + 10 views**

---

## 🔗 Available Relations

All tables have defined relations for type-safe joins:

```typescript
// Example: Get user with all related data
const fullUserData = await db.query.users.findFirst({
  where: eq(users.user_id, 1),
  with: {
    profile: true,
    preferences: true,
    brokerAccounts: {
      with: {
        broker: true
      }
    },
    securityHoldings: {
      with: {
        security: true
      }
    },
    portfolioSummaries: true,
    portfolioGoals: true
  }
});
```

---

## 💡 Common Patterns

### Transaction

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({...}).returning();
  await tx.insert(userProfiles).values({ user_id: user.user_id, ... });
  await tx.insert(userPreferences).values({ user_id: user.user_id, ... });
});
```

### Pagination

```typescript
const page = 1;
const pageSize = 10;

const results = await db
  .select()
  .from(users)
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

### Sorting

```typescript
import { desc, asc } from 'drizzle-orm';

const results = await db
  .select()
  .from(securityTransactions)
  .orderBy(desc(securityTransactions.transaction_date));
```

### Filtering

```typescript
import { and, or, gte, lte } from 'drizzle-orm';

const results = await db
  .select()
  .from(securityTransactions)
  .where(and(
    eq(securityTransactions.user_id, 1),
    gte(securityTransactions.transaction_date, '2024-01-01'),
    or(
      eq(securityTransactions.transaction_type, 'buy'),
      eq(securityTransactions.transaction_type, 'sell')
    )
  ));
```

### Aggregations

```typescript
import { count, sum, avg } from 'drizzle-orm';

const stats = await db
  .select({
    totalTransactions: count(),
    totalAmount: sum(securityTransactions.total_amount),
    avgAmount: avg(securityTransactions.total_amount)
  })
  .from(securityTransactions)
  .where(eq(securityTransactions.user_id, 1));
```

---

## ⚠️ Important Notes

1. **Generated Columns**: Don't insert/update `total_investment`, `current_value`, `unrealized_pnl` in `user_security_holdings` - they're auto-calculated.

2. **Triggers**: Database triggers automatically update `updated_at` timestamps and holdings after transactions.

3. **Views**: Views are read-only. Use underlying tables for modifications.

4. **JSONB**: Pass JSON objects directly, don't stringify:
   ```typescript
   // ✅ Correct
   report_data: { summary: { total: 1000 } }
   
   // ❌ Wrong
   report_data: JSON.stringify({ summary: { total: 1000 } })
   ```

---

## 📚 Documentation

- **[Database README](src/db/README.md)** - Comprehensive schema documentation
- **[Migration Guide](MIGRATION_GUIDE.md)** - Step-by-step migration instructions
- **[Conversion Summary](SCHEMA_CONVERSION_SUMMARY.md)** - Complete conversion details
- **[Drizzle ORM Docs](https://orm.drizzle.team)** - Official documentation

---

## 🛠️ Development Commands

```bash
# Development
yarn dev              # Start dev server with hot reload

# Database
yarn db:generate      # Generate migration from schema changes
yarn db:migrate       # Apply migrations to database
yarn db:studio        # Open visual database browser

# Build
yarn build           # Compile TypeScript
yarn start           # Start production server
```

---

## 🐛 Troubleshooting

**Issue: "Database connection failed"**
- Check `.env` file has correct credentials
- Ensure PostgreSQL is running
- Verify database exists

**Issue: "Table does not exist"**
- Run `yarn db:migrate` to apply migrations
- Check migration files in `/drizzle` folder

**Issue: "Trigger not working"**
- Apply functions: `psql -d portfolio_management -f src/db/functions.sql`

**Issue: "View not found"**
- Apply views: `psql -d portfolio_management -f ../schema/07_views.sql`

---

## ✅ You're Ready!

Start building your portfolio management features with type-safe queries! 🎉

Check the [Database README](src/db/README.md) for advanced usage examples.

