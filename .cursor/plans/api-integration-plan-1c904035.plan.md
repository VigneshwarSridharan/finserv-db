<!-- 1c904035-3ef8-46b7-ac5e-a0633c2bf0f0 05bdb026-4382-49e7-b340-2d69f084736b -->
# Integrate Proper API Implementation for Banking, Assets, and Portfolio Features

## 1. Update Type Definitions (domain.types.ts)

### Banking Types

- Update `BankAccount` interface:
- Change `bank_account_id` → `account_id`
- Add `bank` object (nested Bank type)
- Update `account_type` enum to lowercase: `'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'nro' | 'nre'`
- Add `account_name`, `branch_name` (not `branch`), `opened_date`
- Remove `current_balance` (not in schema)

- Update `Bank` interface:
- Add `bank_type`, `contact_email`, `contact_phone`, `address`, `city`, `state`, `country`, `updated_at`
- Update all fields to match backend schema

- Update `FixedDeposit` interface:
- Change `bank_account_id` → `account_id`
- Add `maturity_amount`, `interest_payout_frequency`, `auto_renewal`, `premature_withdrawal_allowed`, `premature_penalty_rate`, `is_active`, `updated_at`
- Remove `status` (use `is_active` instead)

- Update `RecurringDeposit` interface:
- Change `bank_account_id` → `account_id`
- Add `installment_day`, `auto_debit`, `premature_closure_allowed`, `premature_penalty_rate`, `is_active`, `updated_at`
- Remove `status` and `total_deposits`

### Assets Types

- Update `Asset` interface:
- Remove `asset_type` field (not in backend schema)
- Add `category`, `subcategory`, `returns`, `returns_percentage` (calculated by backend)
- Add `subcategory_id`, `quantity`, `unit`, `location`, `storage_location`, `insurance_*` fields
- Update `current_value` to be optional
- Add `is_active`, `updated_at`

- Update `AssetCategory` interface:
- Add `category_type` field
- Add `is_active`, `updated_at`
- Remove `user_id` (backend doesn't return it in list)

### Portfolio Types

- Update `PortfolioGoal` interface:
- Add `progress_percentage`, `remaining_amount` (calculated by backend)
- Update `priority` to string enum: `'low' | 'medium' | 'high'`
- Add `is_achieved`, `achieved_date`, `notes`, `updated_at`

## 2. Banking Features Updates

### BankAccountsPage.tsx

- Update local `BankAccount` interface to import from domain.types
- Change all `id` references to `account_id`
- Update form schema:
- Change `bank_id` validation message format
- Update `account_type` enum to lowercase values
- Add `account_name` field
- Change `branch` to `branch_name`
- Remove `opening_balance`, `current_balance` (not in create API)
- Update table/mobile display:
- Use `account.bank?.bank_name` instead of `account.bank_name`
- Remove `current_balance` display
- Change `branch` to `branch_name`
- Update `account_holder_name` to `account_name`
- Fix form dropdown for account_type to use lowercase values: 'savings', 'current', 'salary'
- Add proper Dialog structure: Portal, DialogBackdrop, DialogPositioner
- Fix EmptyState API: use `actionLabel` and `onAction` instead of `action`
- Import banks service correctly: `banksService` not `banksService`

### FixedDepositsPage.tsx

- Update local interface to match backend response
- Change `id` → `fd_id`
- Update service import: `fixedDepositService` not `fixedDepositsService`
- Display `maturity_amount`, `interest_rate` from backend response
- Add fields for `interest_payout_frequency`, `auto_renewal`
- Change status check from `status === 'ACTIVE'` to `is_active === true`

### RecurringDepositsPage.tsx

- Update local interface to match backend response
- Change `id` → `rd_id`
- Add `installment_day`, `auto_debit` fields
- Change status handling to use `is_active`
- Update service calls to match backend endpoints

## 3. Assets Features Updates

### AssetsListPage.tsx

- Import `Asset` type from domain.types
- Change `id` → `asset_id`
- Remove `asset_type`, `category_name` direct fields
- Use `asset.category.category_name` and `asset.category.category_type`
- Add `asset.subcategory?.subcategory_name` display
- Use backend-calculated `returns` and `returns_percentage` instead of local calculation
- Parse string amounts to numbers: `parseFloat(asset.purchase_price)`, `parseFloat(asset.current_value)`
- Update gain/loss calculation to use backend values

### CategoriesPage.tsx

- Update interface to include `category_type`, `is_active`
- Change `id` → `category_id`
- Add category type filter/display
- Use proper `assetCategoryService` methods

## 4. Portfolio Features Updates

### GoalsPage.tsx

- Import `PortfolioGoal` type from domain.types
- Change `id` → `goal_id`
- Use backend `progress_percentage` instead of local calculation
- Add `is_achieved`, `priority` fields
- Update goal type enum values
- Fix service import: `portfolioGoalService` (consistent naming)
- Parse string amounts: `parseFloat(goal.target_amount)`, `parseFloat(goal.current_amount)`
- Add EmptyState fixes (actionLabel/onAction)

### AlertsPage.tsx

- Update interface to match backend schema
- Change `id` → `alert_id`
- Add proper alert type and status fields
- Fix service calls

### WatchlistPage.tsx

- Update interface to match backend schema
- Change `id` → `watchlist_id`
- Add proper fields from backend response
- Fix EmptyState API usage

## 5. Common Component Fixes

All form dialogs need:

- Wrap `DialogContent` with `Portal`, `DialogBackdrop`, `DialogPositioner`
- Import these from `@chakra-ui/react`
- Update enum SelectFields to use standard `<option>` elements instead of Chakra Select components
- Ensure `InputField` supports `step` prop (already fixed in FormField.tsx)

## 6. Service Import Corrections

Update service imports to match actual service names:

- `portfolioGoalsService` → `portfolioGoalService` (singular)
- `fixedDepositsService` → `fixedDepositService` (singular)
- Add missing `banksService` export in banking.service.ts

## Implementation Order

1. Update domain.types.ts with all interface changes
2. Fix service imports and exports
3. Update Banking features (BankAccountsPage, FixedDepositsPage, RecurringDepositsPage)
4. Update Assets features (AssetsListPage, CategoriesPage)
5. Update Portfolio features (GoalsPage, AlertsPage, WatchlistPage)
6. Test all features end-to-end

### To-dos

- [ ] Update all type definitions in domain.types.ts to match backend schemas
- [ ] Update BankAccountsPage.tsx with correct field mappings and Dialog structure
- [ ] Update FixedDepositsPage.tsx and RecurringDepositsPage.tsx
- [ ] Update AssetsListPage.tsx with backend response structure
- [ ] Update CategoriesPage.tsx with proper schema
- [ ] Update GoalsPage.tsx with backend calculations
- [ ] Update AlertsPage.tsx and WatchlistPage.tsx
- [ ] Fix service imports and naming inconsistencies
- [ ] Test all updated features end-to-end