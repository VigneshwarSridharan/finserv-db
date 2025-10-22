# finserv-db

Database schema definitions for the Financial Services application.

## Overview

This repository contains comprehensive database schema definitions for a financial services platform with support for customer management, account operations, and Fixed Deposit (FD) management.

## Database Schema

The schema is organized into numbered SQL files for easy sequential execution:

### Core Tables

#### 1. Users Table (`01_create_users_table.sql`)
Manages user authentication and basic profile information.

**Key Features:**
- Unique username and email
- Password hash storage
- Email validation
- Active/verified status tracking
- Auto-updating timestamps

#### 2. Customers Table (`02_create_customers_table.sql`)
Stores detailed customer information for KYC and business purposes.

**Key Features:**
- Complete address information
- KYC verification status and details
- Financial information (occupation, income, source of funds)
- Risk rating
- Customer status management

#### 3. Account Types Table (`03_create_account_types_table.sql`)
Reference table for different account types (Savings, Current, Salary, FD).

**Pre-loaded Account Types:**
- Savings Account
- Current Account
- Salary Account
- Fixed Deposit Account

#### 4. Accounts Table (`04_create_accounts_table.sql`)
Manages customer accounts.

**Key Features:**
- Links to customers and account types
- Current and available balance tracking
- Multi-currency support
- Interest rate configuration
- Account status management
- Branch and relationship manager assignment

#### 5. Fixed Deposits Table (`05_create_fixed_deposits_table.sql`)
Dedicated table for managing Fixed Deposit details.

**Key Attributes:**
- **Principal Amount**: The deposit amount
- **Interest Rate**: Annual interest rate percentage
- **Tenure**: Duration in months (and days for precision)
- **Maturity Date**: Calculated maturity date
- **Customer Reference**: Links to customers table
- Interest type (Simple/Compound)
- Interest payout frequency (Monthly/Quarterly/Annual/Maturity)
- Auto-renewal options
- Premature withdrawal settings
- Nominee information
- Status tracking (Active, Matured, Closed, etc.)

**Helper Functions:**
- `calculate_fd_maturity_amount()`: Calculates maturity amount based on principal, rate, tenure, and interest type

#### 6. Transactions Table (`06_create_transactions_table.sql`)
Records all financial transactions in the system.

**Key Features:**
- Support for various transaction types
- From/To account tracking
- FD-related transaction linking
- Transaction status management
- Balance snapshots

#### 7. FD Interest Payments Table (`07_create_fd_interest_payments_table.sql`)
Tracks interest payments made on fixed deposits.

**Key Features:**
- Payment period tracking
- Tax deduction recording
- Payment status management
- Links to FD and transaction records

#### 8. Audit Logs Table (`08_create_audit_logs_table.sql`)
Comprehensive audit trail for compliance and security.

**Key Features:**
- Tracks all important system activities
- Records old and new values (JSONB)
- User and IP tracking
- GIN indexes for efficient JSONB queries

## Database Setup

### Prerequisites
- PostgreSQL 12 or higher

### Installation

Execute the SQL files in numerical order:

```bash
psql -U your_username -d your_database -f schema/01_create_users_table.sql
psql -U your_username -d your_database -f schema/02_create_customers_table.sql
psql -U your_username -d your_database -f schema/03_create_account_types_table.sql
psql -U your_username -d your_database -f schema/04_create_accounts_table.sql
psql -U your_username -d your_database -f schema/05_create_fixed_deposits_table.sql
psql -U your_username -d your_database -f schema/06_create_transactions_table.sql
psql -U your_username -d your_database -f schema/07_create_fd_interest_payments_table.sql
psql -U your_username -d your_database -f schema/08_create_audit_logs_table.sql
```

Or execute all at once:

```bash
for file in schema/*.sql; do
    psql -U your_username -d your_database -f "$file"
done
```

## Key Features

### 1. Comprehensive Fixed Deposit Management
- Multiple interest types (Simple/Compound)
- Flexible interest payout frequencies
- Auto-renewal capabilities
- Premature withdrawal support with penalty rates
- Nominee information
- Automated maturity amount calculation

### 2. Robust Customer Management
- Complete KYC workflow
- Risk rating system
- Customer status tracking
- Multi-level address information

### 3. Flexible Account System
- Multiple account types support
- Real-time balance tracking
- Multi-currency support
- Account status management

### 4. Complete Audit Trail
- All transactions logged
- User activity tracking
- Change history with old/new values
- Compliance-ready

### 5. Data Integrity
- Foreign key constraints
- Check constraints for data validation
- Automatic timestamp updates
- Indexed for performance

## Entity Relationships

```
users (1) ─── (1) customers
                    │
                    ├─── (1:N) accounts
                    │           │
                    │           └─── (N:1) account_types
                    │
                    └─── (1:N) fixed_deposits
                                    │
                                    ├─── (1:N) fd_interest_payments
                                    └─── (1:N) transactions

transactions (N) ─── (1) accounts [from/to]
transactions (N) ─── (1) fixed_deposits [related]

audit_logs ─── users (N:1)
```

## Business Rules

### Fixed Deposits
1. Minimum principal amount validation
2. Interest rate must be between 0-100%
3. Tenure must be positive
4. Maturity amount must be >= principal amount
5. Status transitions: ACTIVE → MATURED/CLOSED/PREMATURELY_CLOSED → RENEWED

### Accounts
1. Balance cannot be negative
2. Account status controls operations
3. Closed accounts cannot have transactions

### Customers
1. KYC verification required for high-value operations
2. Risk rating influences transaction limits
3. One customer per user

## Future Enhancements

Potential additions to consider:
- Loan management tables
- Investment portfolio tables
- Credit/Debit card management
- Standing instructions
- Beneficiary management
- Multi-factor authentication logs
- Document management

## Contributing

When adding new schema files:
1. Use sequential numbering (09_, 10_, etc.)
2. Include proper indexes
3. Add foreign key constraints
4. Include check constraints for data validation
5. Update this README with documentation

## License

[Your License Here]
