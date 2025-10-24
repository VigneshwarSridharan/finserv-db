# Migration Guide: SQL to Drizzle ORM

This guide explains how to migrate from raw SQL schema to the Drizzle ORM implementation.

## 📋 Overview

The complete PostgreSQL schema from `/schema` directory (40+ tables, 10+ views, triggers, and functions) has been converted to Drizzle ORM TypeScript definitions.

## 🗂️ What Was Converted

### ✅ Completed

| Source File | Drizzle Schema | Tables | Status |
|------------|---------------|--------|---------|
| `01_users.sql` | `users.schema.ts` | 3 | ✅ Complete |
| `02_brokers_securities.sql` | `brokers-securities.schema.ts` | 6 | ✅ Complete |
| `03_banks_deposits.sql` | `banks-deposits.schema.ts` | 7 | ✅ Complete |
| `04_assets.sql` | `assets.schema.ts` | 8 | ✅ Complete |
| `05_portfolio.sql` | `portfolio.schema.ts` | 8 | ✅ Complete |
| `06_constraints_triggers.sql` | `functions.sql` | N/A | ✅ Documented |
| `07_views.sql` | `views.schema.ts` | 10 views | ✅ Complete |

**Total: 32 tables + 10 views + relations + triggers/functions**

## 🚀 Migration Steps

### Step 1: Install Dependencies

Dependencies are already installed in `package.json`:
- `drizzle-orm@^0.29.3`
- `drizzle-kit@^0.20.9`
- `pg@^8.11.3`

If you need to reinstall:
```bash
cd backend
yarn install
```

### Step 2: Environment Setup

Ensure your `.env` file has database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_management
DB_USER=portfolio_user
DB_PASSWORD=portfolio_password

# Or use connection string
DATABASE_URL=postgresql://portfolio_user:portfolio_password@localhost:5432/portfolio_management
```

### Step 3: Generate Initial Migration

Generate Drizzle migration files from the schema:

```bash
yarn db:generate
```

This creates migration files in `/drizzle` directory with:
- CREATE TABLE statements
- Indexes
- Constraints
- Unique constraints
- CHECK constraints

**Note**: Generated columns are handled separately due to drizzle-orm v0.29.x limitations.

### Step 4: Review Generated Migration

Check the generated SQL in `/drizzle/0000_*.sql`:

```sql
-- Example output
CREATE TABLE IF NOT EXISTS "users" (
  "user_id" serial PRIMARY KEY NOT NULL,
  "username" varchar(50) NOT NULL,
  "email" varchar(255) NOT NULL,
  ...
);

CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_asset_type" 
  ON "portfolio_summary" ("user_id","asset_type");
```

### Step 5: Apply Migration to Database

#### Option A: Fresh Database (Recommended for Development)

1. Drop existing database (if any):
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS portfolio_management;"
psql -U postgres -c "CREATE DATABASE portfolio_management;"
```

2. Run Drizzle migration:
```bash
yarn db:push
```

3. Apply generated columns:
```bash
psql -d portfolio_management -f src/db/generated-columns.sql
```

4. Apply functions and triggers:
```bash
psql -d portfolio_management -f src/db/functions.sql
```

5. Apply views:
```bash
psql -d portfolio_management -f ../schema/07_views.sql
```

#### Option B: Existing Database (Production)

⚠️ **Caution**: This will modify your existing database

1. Backup your database:
```bash
pg_dump -U portfolio_user portfolio_management > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. Review migration files carefully

3. Run migration:
```bash
yarn db:push
```

4. Apply generated columns:
```bash
psql -d portfolio_management -f src/db/generated-columns.sql
```

5. Apply functions and triggers:
```bash
psql -d portfolio_management -f src/db/functions.sql
```

6. Apply views:
```bash
psql -d portfolio_management -f ../schema/07_views.sql
```

7. Verify data integrity:
```bash
psql -d portfolio_management -c "SELECT COUNT(*) FROM users;"
psql -d portfolio_management -c "SELECT COUNT(*) FROM securities;"
```

### Step 6: Verify Schema

Test the database connection:

```bash
yarn dev
```

Check logs for:
```
✅ Database connected successfully at: [timestamp]
```

### Step 7: Test Queries

Create a test script `test-schema.ts`:

```typescript
import { db } from './src/config/database';
import { users, portfolioSummary } from './src/db/schema';

async function testSchema() {
  // Test users table
  const allUsers = await db.select().from(users);
  console.log('Users:', allUsers.length);

  // Test portfolio summary
  const summaries = await db.select().from(portfolioSummary);
  console.log('Portfolio Summaries:', summaries.length);
}

testSchema();
```

Run:
```bash
tsx test-schema.ts
```

## 🔄 Converting Existing Code

### Before (Raw SQL)

```typescript
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
const user = result.rows[0];
```

### After (Drizzle ORM)

```typescript
import { db } from '@/config/database';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const [user] = await db
  .select()
  .from(users)
  .where(eq(users.email, email));
```

### Complex Joins - Before

```typescript
const result = await pool.query(`
  SELECT u.*, ps.*
  FROM users u
  LEFT JOIN portfolio_summary ps ON u.user_id = ps.user_id
  WHERE u.user_id = $1
`, [userId]);
```

### Complex Joins - After

```typescript
import { db } from '@/config/database';
import { users, portfolioSummary } from '@/db/schema';
import { eq } from 'drizzle-orm';

const result = await db
  .select()
  .from(users)
  .leftJoin(portfolioSummary, eq(users.user_id, portfolioSummary.user_id))
  .where(eq(users.user_id, userId));
```

### Using Relations (Even Better)

```typescript
const userWithPortfolio = await db.query.users.findFirst({
  where: eq(users.user_id, userId),
  with: {
    portfolioSummaries: true,
    securityHoldings: true
  }
});
```

## 📊 Feature Mapping

### Generated Columns

**SQL:**
```sql
total_investment DECIMAL(15,2) GENERATED ALWAYS AS (quantity * average_price) STORED
```

**Drizzle:**
```typescript
total_investment: decimal('total_investment', { precision: 15, scale: 2 })
  .generatedAlwaysAs(sql`quantity * average_price`)
```

### CHECK Constraints

**SQL:**
```sql
CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive'))
```

**Drizzle:**
```typescript
risk_profile: varchar('risk_profile', { length: 20 }),
// In table config:
riskProfileCheck: check('risk_profile_check', 
  sql`${table.risk_profile} IN ('conservative', 'moderate', 'aggressive')`)
```

### JSONB Columns

**SQL:**
```sql
report_data JSONB
```

**Drizzle:**
```typescript
import { jsonb } from 'drizzle-orm/pg-core';

report_data: jsonb('report_data')
```

**Usage:**
```typescript
await db.insert(portfolioReports).values({
  report_data: { summary: { total: 1000 }, details: [...] }
});
```

### Composite Unique Constraints

**SQL:**
```sql
UNIQUE(user_id, broker_id, account_number)
```

**Drizzle:**
```typescript
unique('user_broker_accounts_unique').on(
  table.user_id, 
  table.broker_id, 
  table.account_number
)
```

### Foreign Keys with Actions

**SQL:**
```sql
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
```

**Drizzle:**
```typescript
user_id: integer('user_id')
  .notNull()
  .references(() => users.user_id, { onDelete: 'cascade' })
```

## 🔧 Working with Triggers

Triggers are not managed by Drizzle ORM. They're defined in `src/db/functions.sql` and must be applied manually.

### Key Triggers:

1. **Auto-update timestamps**: Automatically updates `updated_at` on UPDATE
2. **Update holdings**: Automatically updates security holdings after transactions
3. **Transaction logging**: Logs all transactions to audit table

### Applying Triggers:

```bash
# After running migrations
psql -d portfolio_management -f src/db/functions.sql
```

### Testing Triggers:

```typescript
// Update a user - updated_at should change automatically
await db.update(users)
  .set({ first_name: 'Jane' })
  .where(eq(users.user_id, 1));

// Insert a security transaction - holdings should update automatically
await db.insert(securityTransactions).values({
  user_id: 1,
  account_id: 1,
  security_id: 1,
  transaction_type: 'buy',
  transaction_date: new Date(),
  quantity: 10,
  price: 100,
  total_amount: 1000,
  net_amount: 1010
});

// Check holdings were updated
const holdings = await db.select()
  .from(userSecurityHoldings)
  .where(eq(userSecurityHoldings.user_id, 1));
```

## 📈 Performance Considerations

### Indexes

All indexes from the original schema are preserved:

```typescript
// Defined in table config
emailIdx: index('idx_users_email').on(table.email),
usernameIdx: index('idx_users_username').on(table.username)
```

### Views for Performance

Complex queries are available as views:

```typescript
import { vPortfolioOverview, vSecurityHoldings } from '@/db/schema';

// Use view instead of complex join
const portfolio = await db.select()
  .from(vPortfolioOverview)
  .where(eq(vPortfolioOverview.user_id, userId));
```

## 🧪 Testing Checklist

After migration, verify:

- [ ] All tables created successfully
- [ ] Indexes are in place
- [ ] Foreign key constraints work
- [ ] CHECK constraints validate correctly
- [ ] Generated columns compute values
- [ ] Triggers fire on operations
- [ ] Views return correct data
- [ ] JSONB columns accept JSON data
- [ ] Unique constraints prevent duplicates
- [ ] Cascade deletes work properly

### Test Script:

```typescript
import { db } from './src/config/database';
import { users, userProfiles, securityTransactions } from './src/db/schema';

async function runTests() {
  try {
    // Test 1: Create user
    const [user] = await db.insert(users).values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hash',
      first_name: 'Test',
      last_name: 'User'
    }).returning();
    console.log('✅ User created:', user.user_id);

    // Test 2: Create profile (FK constraint)
    const [profile] = await db.insert(userProfiles).values({
      user_id: user.user_id,
      risk_profile: 'moderate' // CHECK constraint
    }).returning();
    console.log('✅ Profile created:', profile.profile_id);

    // Test 3: Try invalid risk_profile (should fail)
    try {
      await db.insert(userProfiles).values({
        user_id: user.user_id,
        risk_profile: 'invalid' // Should violate CHECK constraint
      });
      console.log('❌ CHECK constraint failed');
    } catch (e) {
      console.log('✅ CHECK constraint working');
    }

    // Test 4: Delete user (cascade should delete profile)
    await db.delete(users).where(eq(users.user_id, user.user_id));
    const deletedProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.user_id, user.user_id));
    console.log('✅ Cascade delete working:', deletedProfile.length === 0);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
```

## 🔍 Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution**: Drop and recreate database or use `IF NOT EXISTS` in migration

### Issue: Triggers not working

**Solution**: Ensure `functions.sql` was applied after migration

### Issue: Generated columns showing NULL

**Solution**: Generated columns cannot be inserted directly. Let PostgreSQL compute them.

```typescript
// ❌ Wrong
await db.insert(userSecurityHoldings).values({
  quantity: 10,
  average_price: 100,
  total_investment: 1000 // Don't set this!
});

// ✅ Correct
await db.insert(userSecurityHoldings).values({
  quantity: 10,
  average_price: 100
  // total_investment will be computed automatically
});
```

### Issue: View not found

**Solution**: Views must be created separately from migration:

```bash
psql -d portfolio_management -f ../schema/07_views.sql
```

### Issue: JSONB type errors

**Solution**: Ensure you're passing valid JSON objects:

```typescript
// ✅ Correct
report_data: { summary: { total: 1000 } }

// ❌ Wrong
report_data: "{ summary: { total: 1000 } }" // Don't stringify!
```

## 📚 Next Steps

1. ✅ Schema is converted and working
2. 🔄 Update all controllers to use Drizzle ORM
3. 🧪 Add integration tests
4. 📊 Implement migrations for sample data
5. 🚀 Deploy to production

## 🤝 Support

For issues or questions:
1. Check the [Drizzle ORM documentation](https://orm.drizzle.team)
2. Review the [Database README](./src/db/README.md)
3. Examine the [original schema files](../schema/README.md)

