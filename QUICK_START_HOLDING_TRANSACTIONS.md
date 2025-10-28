# Quick Start: Holding Transactions Feature

## Prerequisites
- Database is running
- Backend dependencies installed
- Frontend dependencies installed

## Setup Steps (Do this ONCE)

### Step 1: Run Database Migration

The view needs to be updated to include `holding_id`, `account_id`, and `security_id`.

```bash
# Navigate to project root
cd /Users/vigneshwarsridharan/Documents/vigneshwar/learning/finserv-db

# Run the migration
psql -U postgres -d finserv_db -f schema/migrations/add_holding_id_to_view.sql
```

Or manually in your database client:
```sql
DROP VIEW IF EXISTS v_security_holdings;

CREATE VIEW v_security_holdings AS
SELECT 
    ush.holding_id,
    ush.user_id,
    ush.account_id,
    ush.security_id,
    u.first_name || ' ' || u.last_name as user_name,
    b.broker_name,
    uba.account_number,
    s.symbol,
    s.name as security_name,
    s.security_type,
    s.exchange,
    s.sector,
    ush.quantity,
    ush.average_price,
    ush.current_price,
    ush.total_investment,
    ush.current_value,
    ush.unrealized_pnl,
    CASE 
        WHEN ush.average_price > 0 THEN 
            ROUND(((ush.current_price - ush.average_price) / ush.average_price) * 100, 2)
        ELSE 0 
    END as return_percentage,
    ush.first_purchase_date,
    ush.last_purchase_date
FROM user_security_holdings ush
JOIN users u ON ush.user_id = u.user_id
JOIN user_broker_accounts uba ON ush.account_id = uba.account_id
JOIN brokers b ON uba.broker_id = b.broker_id
JOIN securities s ON ush.security_id = s.security_id
WHERE u.is_active = TRUE AND s.is_active = TRUE;
```

### Step 2: Start Backend

```bash
cd backend
yarn dev
```

### Step 3: Start Frontend

```bash
cd frontend
yarn dev
```

## Using the Feature

### View Transaction History

1. Navigate to **Holdings** page
2. Find any holding in the table
3. Click the **>** (chevron) icon in the first column
4. The row expands to show transaction history

### Add New Transaction

1. Expand a holding row (see above)
2. Click **"Add Transaction"** button
3. Fill in the form:
   - **Transaction Type**: buy, sell, bonus, split, dividend
   - **Date**: Transaction date
   - **Quantity**: Number of shares/units
   - **Price**: Price per unit
   - **Charges**: Brokerage, taxes, other charges (optional)
   - **Notes**: Any additional notes (optional)
4. **Total Amount** and **Net Amount** calculate automatically
5. Click **"Add Transaction"** to save

### Mobile View

- Holdings show as accordion cards
- Tap to expand holding details
- Transaction history automatically shows in expanded view
- "Add Transaction" button available

## API Endpoints Used

- `GET /api/holdings/securities` - Get all holdings (now includes holding_id, account_id, security_id)
- `GET /api/holdings/securities/:id/transactions` - Get transactions for a holding
- `POST /api/transactions/securities` - Create new transaction

## Troubleshooting

### Issue: "holding_id is undefined"
**Solution**: Database migration not run. Go back to Step 1.

### Issue: Transactions not loading
**Solution**: 
1. Check browser console (F12)
2. Verify backend is running
3. Test API: `GET http://localhost:3000/api/holdings/securities`

### Issue: Cannot add transaction
**Solution**:
1. Check all required fields are filled
2. Ensure quantity and price are positive numbers
3. Check backend logs for errors

### Issue: Holdings table doesn't show expand icon
**Solution**: Frontend may need restart. Press Ctrl+C and run `yarn dev` again.

## Feature Demo Workflow

1. **View your holdings** → Navigate to Holdings page
2. **Expand a holding** → Click chevron icon
3. **See transaction history** → View past buys/sells
4. **Add new transaction** → Click "Add Transaction"
5. **Fill form** → Enter transaction details
6. **Auto-calculation** → Watch amounts calculate
7. **Save** → Submit the form
8. **Verify** → Transaction appears in list
9. **Check holding** → Holding values update accordingly

## What Gets Updated

When you add a transaction:
- ✅ Transaction is saved to database
- ✅ Holdings table refreshes
- ✅ Transaction list refreshes
- ✅ Holding quantities/values recalculate (via backend triggers)
- ✅ Dashboard totals update

## Technical Notes

- Transactions are returned from base `security_transactions` table
- Holdings are from `v_security_holdings` view
- Adding transaction auto-updates holding via backend logic
- Form uses Zod for validation
- React Query manages caching and updates
- Responsive design works on mobile/tablet/desktop

## Need Help?

Check these files for details:
- `frontend/HOLDING_TRANSACTIONS_IMPLEMENTATION.md` - Complete implementation details
- `backend/TEST_HOLDING_TRANSACTIONS.md` - API testing guide
- Browser console (F12) - For frontend errors
- Backend terminal - For API errors


