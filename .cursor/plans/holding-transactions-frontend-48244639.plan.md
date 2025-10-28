<!-- 48244639-ea22-4d5e-81a8-a4aa56b0d258 f702d8e0-f154-4065-a8b0-e15210302f97 -->
# Implement Holding Transactions in Frontend

## Overview

Add expandable rows to HoldingsPage that show transactions for each holding with the ability to add new transactions.

## Implementation Steps

### 1. Add API Service Method

**File:** `frontend/src/api/services/securities.service.ts`

Add new method to `holdingsService`:

```typescript
getTransactions: async (holdingId: number | string): Promise<ApiResponse<SecurityTransaction[]>> => {
  return api.get<SecurityTransaction[]>(`/holdings/securities/${holdingId}/transactions`);
}
```

### 2. Update SecurityHolding Type

**File:** `frontend/src/types/domain.types.ts`

Add `holding_id` field to `SecurityHolding` interface (currently missing but needed for API calls):

```typescript
export interface SecurityHolding {
  holding_id: number;  // Add this field
  user_id: number;
  // ... rest of fields
}
```

### 3. Create HoldingTransactionsList Component

**File:** `frontend/src/features/securities/HoldingTransactionsList.tsx` (new file)

Create a component that:

- Accepts `holdingId`, `accountId`, and `securityId` as props
- Fetches transactions using React Query
- Displays transactions in a table format
- Shows loading/empty states
- Includes an "Add Transaction" button that opens a form dialog
- Formats currency and dates

### 4. Create AddTransactionDialog Component

**File:** `frontend/src/features/securities/AddTransactionDialog.tsx` (new file)

Create a dialog component that:

- Uses Chakra UI Dialog components (matching GoldDetailsDialog pattern)
- Form with react-hook-form and zod validation
- Fields: transaction_type, transaction_date, quantity, price, brokerage, taxes, other_charges, notes
- Auto-calculates total_amount and net_amount
- Pre-fills account_id and security_id from props
- Calls `transactionsService.create()` on submit
- Invalidates relevant queries on success

### 5. Modify HoldingsPage

**File:** `frontend/src/features/securities/HoldingsPage.tsx`

Update to support expandable rows:

- Add state for tracking which rows are expanded
- Modify ResponsiveTable to include expandable functionality
- In the expanded view, render `HoldingTransactionsList` component
- Pass holding_id (or construct key from user_id/account_id/security_id if holding_id unavailable)

**Note:** If holding_id is not available in the API response, we may need to:

- Request backend to include it in the holdings view response, OR
- Use a composite key approach in the frontend

### 6. Update ResponsiveTable (if needed)

**File:** `frontend/src/components/common/ResponsiveTable.tsx`

Check if ResponsiveTable already supports row expansion. If not:

- Add optional `expandableConfig` prop
- Include expand/collapse icon in rows
- Render expanded content when row is clicked
- Handle mobile view expansion

## Files to Create

1. `frontend/src/features/securities/HoldingTransactionsList.tsx`
2. `frontend/src/features/securities/AddTransactionDialog.tsx`

## Files to Modify

1. `frontend/src/api/services/securities.service.ts` - Add getTransactions method
2. `frontend/src/types/domain.types.ts` - Add holding_id to SecurityHolding
3. `frontend/src/features/securities/HoldingsPage.tsx` - Add expandable rows
4. `frontend/src/components/common/ResponsiveTable.tsx` - Add expansion support (if needed)

## Key Considerations

- Ensure holding_id is available from the backend API (verify `/holdings/securities` response)
- Match existing UI patterns (Chakra UI v3, form validation, error handling)
- Reuse existing components (ResponsiveTable, FormField, LoadingSpinner, EmptyState)
- Proper React Query cache invalidation after adding transactions
- Mobile-responsive design for transaction list
- Format numbers and dates consistently with rest of app

### To-dos

- [ ] Add getTransactions method to holdingsService
- [ ] Verify holding_id is in API response and update type if needed
- [ ] Create HoldingTransactionsList component to display transactions
- [ ] Create AddTransactionDialog component for adding transactions
- [ ] Modify HoldingsPage to support expandable rows
- [ ] Test expandable rows, transaction display, and adding transactions