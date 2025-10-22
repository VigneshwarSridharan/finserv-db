# Database Schema Design Documentation

## Design Principles

### 1. Normalization
The schema follows third normal form (3NF) principles:
- Each table has a single primary key
- No redundant data across tables
- Dependent data is stored in separate tables with foreign key relationships

### 2. Data Integrity
- **Primary Keys**: All tables use `BIGSERIAL` for auto-incrementing IDs
- **Foreign Keys**: Relationships enforced with CASCADE or SET NULL as appropriate
- **Check Constraints**: Validate data ranges and enum values
- **Unique Constraints**: Prevent duplicate entries where business logic requires

### 3. Scalability
- Indexes on frequently queried columns
- Separate tables for transaction history
- Views for complex aggregations
- Support for horizontal partitioning (future enhancement)

### 4. Audit Trail
- `created_at` and `updated_at` timestamps on all major tables
- Comprehensive `audit_log` table for change tracking
- Session tracking for security

## Table Design Decisions

### Users and Authentication

**Why separate user_sessions table?**
- Allows multiple concurrent sessions per user
- Easy session invalidation without touching user table
- Tracks session metadata (IP, user agent) for security

**Why user_preferences table?**
- Preferences change frequently without affecting core user data
- Easier to add new preference fields
- Can be cached separately for performance

### Securities Management

**Why separate security_types table?**
- Centralized security type management
- Easy to add new types without schema changes
- Supports filtering and categorization

**Why separate mutual_funds and bonds tables?**
- Each has unique attributes not applicable to all securities
- Follows single responsibility principle
- Avoids null values in main securities table

**Why track both holdings and transactions?**
- Holdings represent current state
- Transactions represent historical activity
- Allows portfolio rebalancing calculations
- Supports tax reporting (FIFO, LIFO)

### Banking and Deposits

**Why separate FD and RD tables?**
- Different business logic and attributes
- FD is typically single payment
- RD requires payment tracking
- Different maturity calculation methods

**Why rd_payment_history table?**
- Track individual installments
- Support late payments and penalties
- Generate payment schedules
- Calculate total paid vs expected

**Why fd_interest_credits table?**
- Track interest payouts separately
- Support different payout frequencies
- Handle TDS calculations
- Link to destination bank accounts

### Assets

**Why separate tables for gold, silver, and real_estate?**
- Each has unique attributes
- Different valuation methods
- Specific regulatory requirements
- Storage and documentation needs vary

**Why real_estate_documents table?**
- Properties require extensive documentation
- Documents have lifecycle (issue, expiry)
- Support multiple document types per property
- Enable document expiry alerts

**Why generic asset_transactions table?**
- Unified transaction history across asset types
- Common transaction patterns (buy, sell, transfer)
- Simplified reporting and analytics
- Supports cross-asset portfolio views

### Analytics and Reporting

**Why use views instead of tables?**
- Always show current data
- No synchronization issues
- Easier to maintain
- Can be materialized if performance needed

**Why portfolio_alerts table?**
- Centralized notification system
- Supports multiple alert types
- Track read/dismissed status
- Enable alert history

## Relationships and Cardinality

### One-to-Many Relationships
- User → Securities Holdings (one user has many holdings)
- User → Bank Accounts (one user has many accounts)
- Security → Transactions (one security has many transactions)
- FD → Interest Credits (one FD has many interest credits)
- RD → Payment History (one RD has many payments)
- Real Estate → Documents (one property has many documents)

### Many-to-One Relationships
- Holdings → Security (many holdings can be of same security)
- Holdings → Broker Account (many holdings in one account)
- Transactions → User (many transactions by one user)

### Optional Relationships (NULL allowed)
- Securities Holding → Broker Account (allows tracking without account)
- FD → Bank Account (FD can exist independently)
- Asset Transaction → counterparty (not all transactions have counterparty)

## Indexing Strategy

### Primary Indexes
- All primary keys (automatic with BIGSERIAL)

### Foreign Key Indexes
- All foreign key columns for join performance
- Example: `user_id` on all user-owned tables

### Query Optimization Indexes
- Frequently filtered columns (status, dates)
- Unique business identifiers (email, username, account numbers)
- Composite indexes where needed (symbol + exchange)

### Avoid Over-Indexing
- No indexes on rarely queried columns
- No indexes on high-cardinality text fields
- Monitor index usage and remove unused indexes

## Data Type Choices

### Monetary Values
```sql
DECIMAL(20, 2)  -- Amounts up to 999 trillion with 2 decimal places
```
- Exact precision for currency
- No floating-point errors
- Sufficient range for all use cases

### Quantities
```sql
DECIMAL(20, 6)  -- Fractional shares/units
```
- Supports fractional shares
- Precise for mutual fund units
- Handles stock splits

### Percentages
```sql
DECIMAL(5, 4)  -- Rates like 7.5000%
```
- Store as decimal (7.5000 not 0.075)
- Precise interest rate calculations
- Supports basis point precision

### Dates vs Timestamps
```sql
DATE          -- For business dates (purchase_date, maturity_date)
TIMESTAMP     -- For audit trail (created_at, updated_at)
```
- DATE for user-facing dates
- TIMESTAMP for system events

### Text Fields
```sql
VARCHAR(N)    -- Fixed max length (email, phone, codes)
TEXT          -- Unlimited length (notes, descriptions)
```
- VARCHAR with limit for validation
- TEXT for user-generated content

## Business Rules Enforced by Schema

### 1. Positive Amounts
```sql
CHECK (principal_amount > 0)
CHECK (quantity >= 0)
```

### 2. Valid Date Ranges
```sql
CHECK (maturity_date > start_date)
```

### 3. Percentage Bounds
```sql
CHECK (ownership_percentage > 0 AND ownership_percentage <= 100)
```

### 4. Status Enumerations
```sql
CHECK (status IN ('ACTIVE', 'MATURED', 'CLOSED'))
```

### 5. Email Format
```sql
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
```

## Future Enhancements

### 1. Partitioning
- Partition `securities_transactions` by date
- Partition `audit_log` by date
- Improves query performance on historical data

### 2. Materialized Views
- Pre-compute portfolio summaries
- Refresh on transaction commits
- Trade-off: speed vs freshness

### 3. Full-Text Search
- Add GIN indexes for document search
- Support searching notes and descriptions
- Enable fuzzy matching

### 4. Temporal Tables
- Track historical values of holdings
- Time-series data for price history
- Support "as-of" date queries

### 5. JSON Support
- Store flexible metadata in JSONB columns
- Support custom user-defined fields
- Enable schema evolution without migrations

## Migration Strategy

### Adding New Columns
```sql
ALTER TABLE table_name 
ADD COLUMN new_column TYPE DEFAULT value;
```
- Always add with DEFAULT
- Avoid NOT NULL on existing tables initially

### Adding New Tables
- Create table
- Add foreign keys
- Create indexes
- Populate seed data
- Update views

### Removing Columns
```sql
-- Step 1: Mark as deprecated
ALTER TABLE table_name 
ALTER COLUMN old_column SET DEFAULT NULL;

-- Step 2: Application migration

-- Step 3: Remove column
ALTER TABLE table_name 
DROP COLUMN old_column;
```

### Renaming Tables/Columns
- Create new with correct name
- Copy data
- Update application
- Drop old
- OR use aliases/views during transition

## Performance Considerations

### Query Optimization
1. Always filter by user_id first
2. Use indexes for date range queries
3. Limit result sets with pagination
4. Use EXPLAIN ANALYZE to verify query plans

### Connection Pooling
- Use connection pooling in application
- Set appropriate pool size
- Handle connection failures gracefully

### Vacuuming
- Enable autovacuum
- Monitor table bloat
- Schedule VACUUM ANALYZE regularly

### Monitoring
- Track slow queries
- Monitor index usage
- Watch table sizes
- Alert on anomalies

## Security Best Practices

### 1. Authentication
- Store only hashed passwords (bcrypt, argon2)
- Implement password complexity requirements
- Use secure session tokens
- Implement token expiration

### 2. Authorization
- Implement row-level security (RLS)
- Use database roles for access control
- Limit user permissions
- Audit privileged operations

### 3. Data Protection
- Encrypt sensitive data at rest
- Use SSL/TLS for connections
- Implement backup encryption
- Regular security audits

### 4. SQL Injection Prevention
- Use parameterized queries only
- Never concatenate user input
- Validate and sanitize all inputs
- Use ORMs with proper escaping

## Testing Strategy

### Unit Tests
- Test constraints (CHECK, NOT NULL)
- Test foreign key cascades
- Test unique constraints
- Test default values

### Integration Tests
- Test multi-table transactions
- Test view correctness
- Test trigger behavior
- Test index effectiveness

### Performance Tests
- Load test with realistic data volumes
- Test query performance at scale
- Benchmark critical queries
- Stress test concurrent operations

## Documentation Standards

### Table Comments
```sql
COMMENT ON TABLE users IS 'Stores user account information and authentication details';
```

### Column Comments
```sql
COMMENT ON COLUMN users.is_active IS 'Indicates if user account is active and can login';
```

### Maintain
- ER diagrams
- Data dictionary
- Business rules documentation
- Change log

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-22  
**Author**: Portfolio Management Team
