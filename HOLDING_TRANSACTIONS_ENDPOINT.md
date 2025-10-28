# Holding Transactions Endpoint Implementation

## Summary
Added a new endpoint to retrieve all transactions associated with a specific security holding.

## Endpoint Details

### Route
```
GET /holdings/securities/:id/transactions
```

### Description
Retrieves all transactions for a specific security holding. The endpoint:
- Verifies the holding exists and belongs to the authenticated user
- Fetches all transactions matching the holding's user_id, account_id, and security_id
- Returns transactions ordered by transaction_date (most recent first)

### Authentication
Requires Bearer token authentication.

### Parameters
- **id** (path parameter, required): The holding ID (integer)

### Response
```json
{
  "success": true,
  "data": [
    {
      "transaction_id": 1,
      "user_id": 1,
      "account_id": 1,
      "security_id": 1,
      "transaction_type": "buy",
      "transaction_date": "2024-01-15",
      "quantity": "100.0000",
      "price": "150.50",
      "total_amount": "15050.00",
      "brokerage": "50.00",
      "taxes": "25.00",
      "other_charges": "10.00",
      "net_amount": "15135.00",
      "notes": "Initial purchase",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Status Codes
- **200 OK**: Successfully retrieved transactions
- **400 Bad Request**: Invalid holding ID
- **403 Forbidden**: Access denied to this holding
- **404 Not Found**: Holding not found

## Implementation Details

### Files Modified

1. **backend/src/controllers/security-holdings.controller.ts**
   - Added `getHoldingTransactions` function
   - Imports `vSecurityTransactions` view and `desc` from drizzle-orm
   - Validates holding ownership before returning transactions

2. **backend/src/routes/security-holdings.routes.ts**
   - Added route: `GET /:id/transactions`
   - Properly positioned after `/:id` route to avoid path conflicts

3. **backend/src/utils/swagger.ts**
   - Added OpenAPI documentation for the new endpoint
   - Includes request/response schemas
   - Tagged under "Security Holdings"

## Usage Example

```bash
# Get transactions for holding ID 5
curl -X GET \
  'http://localhost:3000/api/holdings/securities/5/transactions' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Database Query Logic

The endpoint queries transactions using the holding's unique identifier:
```typescript
// First gets the holding to verify ownership
const holding = userSecurityHoldings.where(holding_id = :id)

// Then fetches all transactions matching:
// - Same user_id
// - Same account_id  
// - Same security_id
const transactions = vSecurityTransactions.where(
  user_id = holding.user_id AND
  account_id = holding.account_id AND
  security_id = holding.security_id
)
```

This ensures we get all historical transactions that contributed to the current holding state.

## Testing

To test the endpoint:
1. Ensure you have a valid holding ID
2. Use a valid authentication token
3. Make a GET request to the endpoint
4. Verify the response includes all buy/sell transactions for that holding

## Notes

- Transactions are returned from the `security_transactions` base table
- Transactions are ordered by `transaction_date` in descending order (most recent first)
- The endpoint validates user ownership to ensure data security
- Holdings are unique by combination of user_id, account_id, and security_id
- To get enriched transaction data (with symbol, security name, etc.), the frontend can join with the securities and accounts tables or use the existing `/transactions/securities` endpoint

