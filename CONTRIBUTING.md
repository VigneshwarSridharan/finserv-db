# Contributing to Portfolio Management Database Schema

Thank you for your interest in contributing to this project! This document provides guidelines for contributing to the database schema.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/finserv-db.git
   cd finserv-db
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- PostgreSQL 12 or higher
- Git
- Basic understanding of SQL and database design

### Local Database Setup
```bash
# Create a test database
createdb portfolio_test_db

# Run the schema
./scripts/setup_database.sh portfolio_test_db

# Verify installation
psql -d portfolio_test_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

## Contributing Guidelines

### Schema Changes

#### Adding a New Table
1. Choose the appropriate schema file based on the table's domain:
   - `01_users.sql` - User management
   - `02_brokers_securities.sql` - Securities and investments
   - `03_banks_deposits.sql` - Banking and deposits
   - `04_assets.sql` - Physical assets
   - `05_portfolio_analytics.sql` - Views and analytics
   - `06_seed_data.sql` - Initial data

2. Follow the naming convention:
   ```sql
   CREATE TABLE IF NOT EXISTS table_name (
       id_column BIGSERIAL PRIMARY KEY,
       -- other columns
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Add appropriate indexes:
   ```sql
   CREATE INDEX idx_table_name_column ON table_name(column);
   ```

4. Add constraints:
   ```sql
   CHECK (amount > 0)
   CHECK (status IN ('ACTIVE', 'INACTIVE'))
   ```

#### Modifying Existing Tables
1. **DO NOT** modify existing columns that could break existing data
2. **DO** add new columns with appropriate defaults
3. **DO** create migration scripts for destructive changes
4. Document the change in the PR description

#### Adding Views
1. Use `CREATE OR REPLACE VIEW` syntax
2. Add descriptive comments
3. Ensure views use appropriate indexes
4. Test performance with realistic data volumes

### Code Style

#### SQL Formatting
- Use UPPERCASE for SQL keywords: `SELECT`, `FROM`, `WHERE`
- Use snake_case for table and column names: `user_id`, `created_at`
- Indent 4 spaces for nested statements
- One column per line in CREATE TABLE statements
- Add trailing commas for easier git diffs

**Example:**
```sql
CREATE TABLE IF NOT EXISTS example_table (
    example_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    example_name VARCHAR(255) NOT NULL,
    example_value DECIMAL(20, 2) CHECK (example_value >= 0),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
);

CREATE INDEX idx_example_table_user_id ON example_table(user_id);
CREATE INDEX idx_example_table_status ON example_table(status);
```

#### Naming Conventions
| Object Type | Convention | Example |
|-------------|------------|---------|
| Tables | snake_case, plural | `user_securities_holdings` |
| Columns | snake_case | `user_id`, `created_at` |
| Primary Keys | `{table}_id` | `user_id`, `security_id` |
| Foreign Keys | same as referenced PK | `user_id` references `users(user_id)` |
| Indexes | `idx_{table}_{column(s)}` | `idx_users_email` |
| Views | descriptive snake_case | `active_securities_holdings` |
| Check Constraints | auto-generated or descriptive | `check_positive_amount` |

### Documentation

#### Required Documentation
1. **Table comments** explaining the table's purpose
2. **Column comments** for non-obvious columns
3. **Update README.md** if adding major features
4. **Add example queries** to `docs/EXAMPLE_QUERIES.md`
5. **Update ER diagram** if adding new relationships

#### Documentation Example
```sql
COMMENT ON TABLE user_securities_holdings IS 
'Stores current securities holdings for each user across all their brokerage accounts';

COMMENT ON COLUMN user_securities_holdings.average_buy_price IS 
'Weighted average purchase price calculated from all buy transactions';
```

### Testing

#### Before Submitting a PR
1. **Test schema creation from scratch:**
   ```bash
   ./scripts/setup_database.sh test_db
   ```

2. **Test with sample data:**
   ```sql
   -- Add test users, securities, etc.
   -- Verify foreign keys work correctly
   -- Test cascade deletes
   ```

3. **Test all views:**
   ```sql
   SELECT * FROM user_portfolio_summary LIMIT 1;
   SELECT * FROM active_securities_holdings LIMIT 10;
   -- etc.
   ```

4. **Check for syntax errors:**
   ```bash
   psql -d test_db -f schema/01_users.sql --set ON_ERROR_STOP=on
   ```

5. **Verify indexes:**
   ```sql
   SELECT tablename, indexname 
   FROM pg_indexes 
   WHERE schemaname = 'public' 
   ORDER BY tablename, indexname;
   ```

#### Performance Testing
For major changes:
1. Create realistic test data (1000s of users, 100k+ transactions)
2. Run EXPLAIN ANALYZE on common queries
3. Verify indexes are being used
4. Document performance impact

### Pull Request Process

1. **Update documentation** for any schema changes
2. **Add example queries** demonstrating new features
3. **Update seed data** if adding lookup tables
4. **Write clear commit messages:**
   ```
   Add support for cryptocurrency tracking
   
   - Add crypto_holdings table
   - Add crypto_transactions table  
   - Add view for crypto portfolio summary
   - Update README with crypto examples
   ```

5. **PR title should be descriptive:**
   - ✅ "Add cryptocurrency asset tracking tables"
   - ❌ "Update schema"

6. **PR description should include:**
   - What changed and why
   - Any breaking changes
   - Migration steps if needed
   - Testing performed

### Migration Guidelines

#### For Breaking Changes
1. Create a migration script in `migrations/` directory
2. Name it: `YYYYMMDD_description.sql`
3. Include both UP and DOWN migrations:
   ```sql
   -- UP Migration
   ALTER TABLE users ADD COLUMN new_column VARCHAR(100);
   
   -- DOWN Migration (in comments or separate file)
   -- ALTER TABLE users DROP COLUMN new_column;
   ```

4. Document the migration process in the PR

#### Example Migration
```sql
-- migrations/20251022_add_cryptocurrency_support.sql

-- Add cryptocurrency security type
INSERT INTO security_types (type_name, description)
VALUES ('Cryptocurrency', 'Digital currencies like Bitcoin, Ethereum')
ON CONFLICT (type_name) DO NOTHING;

-- Add crypto-specific metadata table
CREATE TABLE IF NOT EXISTS cryptocurrency_metadata (
    crypto_id BIGSERIAL PRIMARY KEY,
    security_id BIGINT NOT NULL REFERENCES securities(security_id) ON DELETE CASCADE,
    blockchain VARCHAR(50),
    contract_address VARCHAR(255),
    total_supply DECIMAL(30, 8),
    circulating_supply DECIMAL(30, 8),
    UNIQUE(security_id)
);
```

## Code Review Process

### What Reviewers Look For
- [ ] Schema follows established conventions
- [ ] Appropriate indexes are created
- [ ] Foreign keys have correct CASCADE rules
- [ ] Check constraints validate data
- [ ] Documentation is updated
- [ ] Example queries are provided
- [ ] No breaking changes to existing tables
- [ ] Performance impact is acceptable

### Getting Your PR Merged
1. Address all review comments
2. Ensure all tests pass
3. Get approval from at least one maintainer
4. Squash commits if requested
5. Maintainer will merge when ready

## Feature Requests

### Before Opening an Issue
1. Check if feature already exists
2. Check if issue already opened
3. Consider if it fits the project scope

### Opening a Feature Request
Use this template:

```markdown
## Feature Description
Brief description of the feature

## Use Case
Why is this feature needed?

## Proposed Schema Changes
- New tables needed
- Columns to add
- Views to create

## Example Queries
How would users interact with this feature?

## Considerations
- Performance impact
- Breaking changes
- Migration complexity
```

## Bug Reports

### Reporting a Bug
Include:
1. PostgreSQL version
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Error messages
6. SQL to reproduce (if applicable)

## Questions?

- Open a GitHub issue with the "question" label
- Check existing documentation first
- Be specific about what you're trying to accomplish

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🎉
