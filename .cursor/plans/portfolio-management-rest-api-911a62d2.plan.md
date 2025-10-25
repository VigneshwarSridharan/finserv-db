<!-- 911a62d2-cfee-4e09-b340-ed172565da08 11697a11-d18d-4946-a3f0-7823a6f7824c -->
# Complete Portfolio Management API Service

## Overview

Extend the existing API with comprehensive CRUD operations for all portfolio entities, prioritizing securities first, with filtering/pagination/sorting capabilities and bulk transaction support.

## Phase 1: Core Infrastructure & Utilities

### 1.1 Shared Utilities

Create utility functions in `src/utils/`:

- **query-helpers.ts**: Pagination, filtering, sorting utilities for all list endpoints
- **bulk-processor.ts**: Bulk transaction validation and processing helpers
- **response-formatter.ts**: Standardized API response formatting

### 1.2 Enhanced Types

Extend `src/types/index.ts` with DTOs and types for:

- Query parameters (pagination, filters, sorting)
- Bulk operation types
- All entity DTOs (create, update, response types)

## Phase 2: Securities Domain (Priority)

### 2.1 Brokers Module

**Files**: `controllers/brokers.controller.ts`, `routes/brokers.routes.ts`, validation schemas

**Endpoints**:

- `GET /brokers` - List all brokers (with filters, pagination)
- `GET /brokers/:id` - Get broker details
- `POST /brokers` - Create broker (admin)
- `PUT /brokers/:id` - Update broker
- `DELETE /brokers/:id` - Delete broker

### 2.2 Securities Module

**Files**: `controllers/securities.controller.ts`, `routes/securities.routes.ts`

**Endpoints**:

- `GET /securities` - List securities (filter by type, exchange, sector; pagination)
- `GET /securities/:id` - Get security details with latest price
- `GET /securities/search` - Search securities by symbol/name
- `POST /securities` - Create security
- `PUT /securities/:id` - Update security
- `DELETE /securities/:id` - Delete security

### 2.3 Security Prices Module

**Files**: `controllers/security-prices.controller.ts`, `routes/security-prices.routes.ts`

**Endpoints**:

- `GET /securities/:securityId/prices` - Get price history (date range, pagination)
- `GET /securities/:securityId/prices/latest` - Get latest price
- `POST /securities/:securityId/prices` - Add single price
- `POST /securities/prices/bulk` - Bulk upload prices (CSV/JSON)
- `PUT /securities/:securityId/prices/:priceId` - Update price

### 2.4 User Broker Accounts Module

**Files**: `controllers/user-broker-accounts.controller.ts`, `routes/user-broker-accounts.routes.ts`

**Endpoints**:

- `GET /accounts/brokers` - List user's broker accounts
- `GET /accounts/brokers/:id` - Get account details
- `POST /accounts/brokers` - Create broker account
- `PUT /accounts/brokers/:id` - Update account
- `DELETE /accounts/brokers/:id` - Delete account

### 2.5 Security Holdings Module

**Files**: `controllers/security-holdings.controller.ts`, `routes/security-holdings.routes.ts`

**Endpoints**:

- `GET /holdings/securities` - List holdings (with view data: unrealized P&L, returns)
- `GET /holdings/securities/:id` - Get holding details
- `GET /holdings/securities/summary` - Aggregated holdings summary by sector/type
- `PUT /holdings/securities/:id/current-price` - Update current price
- `DELETE /holdings/securities/:id` - Delete holding

### 2.6 Security Transactions Module

**Files**: `controllers/security-transactions.controller.ts`, `routes/security-transactions.routes.ts`

**Endpoints**:

- `GET /transactions/securities` - List transactions (filter by type, date, security; pagination)
- `GET /transactions/securities/:id` - Get transaction details (with view data)
- `POST /transactions/securities` - Create single transaction (auto-updates holdings)
- `POST /transactions/securities/bulk` - Bulk import transactions (CSV/JSON)
- `PUT /transactions/securities/:id` - Update transaction
- `DELETE /transactions/securities/:id` - Delete transaction (with holding recalculation)

## Phase 3: Banking & Deposits Domain

### 3.1 Banks & Bank Accounts

**Files**: `controllers/banks.controller.ts`, `controllers/bank-accounts.controller.ts`, routes

**Endpoints**:

- `GET /banks` - List banks
- `GET /banks/:id` - Get bank details
- `POST /banks` - Create bank
- `GET /accounts/banks` - List user's bank accounts
- `POST /accounts/banks` - Create bank account
- `PUT /accounts/banks/:id` - Update account

### 3.2 Fixed Deposits

**Files**: `controllers/fixed-deposits.controller.ts`, `routes/fixed-deposits.routes.ts`

**Endpoints**:

- `GET /deposits/fixed` - List FDs (with view data: maturity status, days to maturity)
- `GET /deposits/fixed/:id` - Get FD details with interest payments
- `POST /deposits/fixed` - Create FD
- `PUT /deposits/fixed/:id` - Update FD
- `DELETE /deposits/fixed/:id` - Close FD (premature withdrawal)
- `GET /deposits/fixed/:id/interest-payments` - Get interest payment history

### 3.3 Recurring Deposits

**Files**: `controllers/recurring-deposits.controller.ts`, `routes/recurring-deposits.routes.ts`

**Endpoints**:

- `GET /deposits/recurring` - List RDs (with view data: installment status)
- `GET /deposits/recurring/:id` - Get RD details with installments
- `POST /deposits/recurring` - Create RD
- `PUT /deposits/recurring/:id` - Update RD
- `DELETE /deposits/recurring/:id` - Close RD
- `GET /deposits/recurring/:id/installments` - Get installment history
- `POST /deposits/recurring/:id/installments/:installmentId/pay` - Record installment payment

### 3.4 Bank Transactions

**Files**: `controllers/bank-transactions.controller.ts`, `routes/bank-transactions.routes.ts`

**Endpoints**:

- `GET /transactions/bank` - List bank transactions
- `POST /transactions/bank` - Create bank transaction
- `POST /transactions/bank/bulk` - Bulk import

## Phase 4: Assets Domain

### 4.1 Asset Categories & Management

**Files**: `controllers/assets.controller.ts`, `controllers/asset-categories.controller.ts`, routes

**Endpoints**:

- `GET /assets/categories` - List asset categories
- `GET /assets` - List user assets (with view data: returns, insurance status)
- `GET /assets/:id` - Get asset details
- `POST /assets` - Create asset
- `PUT /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset

### 4.2 Real Estate & Gold Details

**Files**: `controllers/real-estate.controller.ts`, `controllers/gold.controller.ts`, routes

**Endpoints**:

- `GET /assets/:assetId/real-estate` - Get property details
- `POST /assets/:assetId/real-estate` - Add property details
- `PUT /assets/:assetId/real-estate` - Update property details
- `GET /assets/:assetId/gold` - Get gold details
- `POST /assets/:assetId/gold` - Add gold details

### 4.3 Asset Valuations & Transactions

**Endpoints**:

- `GET /assets/:assetId/valuations` - Get valuation history
- `POST /assets/:assetId/valuations` - Add valuation
- `GET /transactions/assets` - List asset transactions
- `POST /transactions/assets` - Create asset transaction
- `POST /transactions/assets/bulk` - Bulk import

## Phase 5: Portfolio Features

### 5.1 Portfolio Goals

**Files**: `controllers/portfolio-goals.controller.ts`, `routes/portfolio-goals.routes.ts`

**Endpoints**:

- `GET /portfolio/goals` - List goals (filter by type, status)
- `GET /portfolio/goals/:id` - Get goal details
- `POST /portfolio/goals` - Create goal
- `PUT /portfolio/goals/:id` - Update goal
- `DELETE /portfolio/goals/:id` - Delete goal
- `POST /portfolio/goals/:id/achieve` - Mark goal as achieved

### 5.2 Asset Allocation

**Files**: `controllers/asset-allocation.controller.ts`, `routes/asset-allocation.routes.ts`

**Endpoints**:

- `GET /portfolio/allocation` - Get allocation targets vs current (with view data)
- `POST /portfolio/allocation` - Create allocation target
- `PUT /portfolio/allocation/:id` - Update target
- `GET /portfolio/allocation/rebalance-suggestions` - Get rebalancing suggestions

### 5.3 Portfolio Alerts

**Files**: `controllers/portfolio-alerts.controller.ts`, `routes/portfolio-alerts.routes.ts`

**Endpoints**:

- `GET /portfolio/alerts` - List alerts
- `POST /portfolio/alerts` - Create alert
- `PUT /portfolio/alerts/:id` - Update alert
- `DELETE /portfolio/alerts/:id` - Delete alert
- `POST /portfolio/alerts/:id/acknowledge` - Acknowledge triggered alert

### 5.4 Watchlist

**Files**: `controllers/watchlist.controller.ts`, `routes/watchlist.routes.ts`

**Endpoints**:

- `GET /portfolio/watchlist` - List watchlist (with view data: current prices, target achievement)
- `POST /portfolio/watchlist` - Add to watchlist
- `PUT /portfolio/watchlist/:id` - Update watchlist item
- `DELETE /portfolio/watchlist/:id` - Remove from watchlist

### 5.5 Portfolio Performance & Reports

**Files**: `controllers/portfolio-performance.controller.ts`, `controllers/portfolio-reports.controller.ts`, routes

**Endpoints**:

- `GET /portfolio/performance` - Get performance history (date range)
- `GET /portfolio/performance/current` - Current performance metrics
- `GET /portfolio/reports` - List generated reports
- `POST /portfolio/reports/generate` - Generate report (monthly/quarterly/yearly)
- `GET /portfolio/reports/:id` - Get report details

### 5.6 Portfolio Overview & Analytics

**Files**: `controllers/portfolio-overview.controller.ts`, `routes/portfolio-overview.routes.ts`

**Endpoints**:

- `GET /portfolio/overview` - Comprehensive overview (integrates v_portfolio_overview view)
- `GET /portfolio/dashboard` - Dashboard summary with all key metrics
- `GET /portfolio/analytics/sector-allocation` - Sector-wise breakdown
- `GET /portfolio/analytics/asset-type-distribution` - Asset type distribution

## Phase 6: User Profile Management

**Files**: `controllers/user-profile.controller.ts`, `routes/user-profile.routes.ts`

**Endpoints**:

- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /profile/preferences` - Get preferences
- `PUT /profile/preferences` - Update preferences

## Phase 7: Integration & Updates

### 7.1 Update app.ts

Register all new routes in `src/app.ts`

### 7.2 Update Swagger Documentation

Update `src/utils/swagger.ts` with all endpoint documentation

### 7.3 Update schema.ts

Ensure `src/db/schema.ts` exports all tables from individual schema files

## Implementation Notes

- **Authentication**: All endpoints except `/auth/*` and `/brokers` (read), `/securities` (read), `/banks` (read) require JWT authentication
- **Authorization**: Users can only access their own data (enforce user_id filtering)
- **Pagination**: Default 20 items, max 100 per page
- **Filtering**: Support common filters per entity (date ranges, status, types)
- **Sorting**: Support ascending/descending on key fields
- **Bulk Operations**: Validate all items before processing, rollback on errors
- **View Integration**: Fetch from database views when available for computed fields
- **Error Handling**: Use existing `ApiError` class, consistent error responses
- **Validation**: Use Zod schemas for all request validation

### To-dos

- [ ] Create shared utilities (query helpers, bulk processor, response formatter) and enhance types
- [ ] Implement brokers CRUD endpoints with controller, routes, and validation
- [ ] Implement securities CRUD endpoints with search functionality
- [ ] Implement security prices endpoints with bulk upload support
- [ ] Implement user broker accounts management endpoints
- [ ] Implement security holdings endpoints with aggregated views
- [ ] Implement security transactions with bulk import and holding auto-updates
- [ ] Implement banks and bank accounts management
- [ ] Implement fixed deposits with interest payment tracking
- [ ] Implement recurring deposits with installment management
- [ ] Implement bank transactions with bulk import
- [ ] Implement assets management with categories and valuations
- [ ] Implement real estate and gold specific details endpoints
- [ ] Implement asset transactions with bulk import
- [ ] Implement portfolio goals management
- [ ] Implement asset allocation with rebalancing suggestions
- [ ] Implement portfolio alerts management
- [ ] Implement watchlist with real-time price tracking
- [ ] Implement portfolio performance tracking and reports generation
- [ ] Implement portfolio overview and analytics dashboard endpoints
- [ ] Implement user profile and preferences management
- [ ] Update app.ts with all routes and enhance Swagger documentation