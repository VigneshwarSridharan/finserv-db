<!-- 1c65368d-c2f4-4ac5-99e4-a65c35b5b6ef 7a6db620-98b3-4187-a739-f40b31d71f37 -->
# Create User Broker Accounts Page

## Overview

Implement a comprehensive page for managing User Broker Accounts (trading accounts) with a modern, responsive design following existing frontend patterns.

## Implementation Steps

### 1. Update Domain Types

**File**: `frontend/src/types/domain.types.ts`

Update the `BrokerAccount` interface to include broker details:

```typescript
export interface BrokerAccount {
  account_id: number;
  user_id: number;
  broker_id: number;
  account_number: string;
  account_type: 'demat' | 'trading' | 'demat_trading';
  dp_id?: string;
  opened_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  broker?: Broker;  // Add broker relationship
}

export interface CreateBrokerAccountRequest {
  broker_id: number;
  account_number: string;
  account_type: 'demat' | 'trading' | 'demat_trading';
  dp_id?: string;
  opened_date?: string;
}
```

### 2. Create Broker Accounts Page Component

**File**: `frontend/src/features/securities/BrokerAccountsPage.tsx` (NEW)

Create a comprehensive page component with:

- Header with "Broker Accounts" title and "Add Account" button
- Stats cards showing: Total Accounts, Active Accounts, Demat Accounts, Trading Accounts
- Search functionality
- Responsive table with columns:
  - Broker Name (from broker relationship)
  - Account Number
  - Account Type (badge with color coding)
  - DP ID
  - Opened Date
  - Status (active/inactive badge)
  - Actions (Edit/Delete)
- Mobile-responsive collapsible rows
- Add/Edit dialog form with fields:
  - Broker (dropdown, fetched from brokerService)
  - Account Number (required)
  - Account Type (dropdown: demat, trading, demat_trading)
  - DP ID (optional)
  - Opened Date (optional date picker)
- Delete confirmation dialog
- Loading states and empty states
- Toast notifications for success/error

Pattern similar to `BankAccountsPage.tsx` with:

- React Hook Form + Zod validation
- React Query for data fetching and mutations
- Chakra UI components
- ResponsiveTable component for mobile support

### 3. Update Sidebar Navigation

**File**: `frontend/src/components/layout/Sidebar.tsx`

Add "Accounts" submenu item under Securities section:

```typescript
{
  icon: FiTrendingUp,
  label: 'Securities',
  path: '/securities',
  subItems: [
    { label: 'Overview', path: '/securities', icon: FiBarChart2 },
    { label: 'Brokers', path: '/securities/brokers', icon: FiBriefcase },
    { label: 'Accounts', path: '/securities/accounts', icon: FiCreditCard }, // NEW
    { label: 'Holdings', path: '/securities/holdings', icon: FiShoppingCart },
    { label: 'Transactions', path: '/securities/transactions', icon: FiRepeat },
  ],
}
```

### 4. Update Mobile Drawer Navigation

**File**: `frontend/src/components/layout/MobileDrawer.tsx`

Add the same "Accounts" navigation item to mobile drawer under Securities section.

### 5. Add Route Configuration

**File**: `frontend/src/routes/index.tsx`

Add:

- Import: `const BrokerAccountsPage = lazy(() => import('../features/securities/BrokerAccountsPage'));`
- Route: `<Route path="securities/accounts" element={<RouteElement><BrokerAccountsPage /></RouteElement>} />`

Place it after the brokers route and before holdings route.

### 6. Backend Service (Already Exists)

The `brokerAccountService` already exists in `frontend/src/api/services/securities.service.ts` with all required methods:

- `getAll()` - GET `/accounts/brokers`
- `getById(id)` - GET `/accounts/brokers/:id`
- `create(data)` - POST `/accounts/brokers`
- `update(id, data)` - PUT `/accounts/brokers/:id`
- `delete(id)` - DELETE `/accounts/brokers/:id`

Also use `brokerService.getAll()` to fetch broker list for the dropdown.

## Design Specifications

### Color Scheme for Account Types

- **demat**: Blue badge
- **trading**: Purple badge
- **demat_trading**: Green badge

### Stats Cards

1. Total Accounts - Blue
2. Active Accounts - Green
3. Demat Accounts - Purple
4. Trading Accounts - Orange

### Validation Rules

- Broker: Required
- Account Number: Required, min 3 characters
- Account Type: Required, enum validation
- DP ID: Optional, max 20 characters
- Opened Date: Optional, valid date format

### Responsive Behavior

- Desktop: Full table with all columns
- Mobile: Collapsible cards with summary (Broker Name + Account Number) and expandable details

## Files to Create/Modify

### New Files

1. `frontend/src/features/securities/BrokerAccountsPage.tsx`

### Modified Files

1. `frontend/src/types/domain.types.ts` - Add broker relationship to BrokerAccount
2. `frontend/src/components/layout/Sidebar.tsx` - Add Accounts submenu
3. `frontend/src/components/layout/MobileDrawer.tsx` - Add Accounts submenu
4. `frontend/src/routes/index.tsx` - Add route and lazy import