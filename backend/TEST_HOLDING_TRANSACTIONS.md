# Testing the Holding Transactions Endpoint

## Quick Test Guide

### 1. Start the Backend Server
```bash
cd backend
yarn dev
```

### 2. Get Authentication Token
Login to get a JWT token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

Save the token from the response.

### 3. Get Your Holdings
First, get a list of your holdings to find a holding ID:
```bash
curl -X GET http://localhost:3000/api/holdings/securities \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get Transactions for a Specific Holding
Using a holding ID from step 3:
```bash
curl -X GET http://localhost:3000/api/holdings/securities/1/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `1` with the actual holding ID.

## Expected Response

```json
{
  "success": true,
  "data": [
    {
      "transaction_id": 123,
      "user_id": 1,
      "account_id": 5,
      "security_id": 42,
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
    },
    {
      "transaction_id": 124,
      "user_id": 1,
      "account_id": 5,
      "security_id": 42,
      "transaction_type": "buy",
      "transaction_date": "2024-02-01",
      "quantity": "50.0000",
      "price": "155.75",
      "total_amount": "7787.50",
      "brokerage": "25.00",
      "taxes": "12.50",
      "other_charges": "5.00",
      "net_amount": "7830.00",
      "notes": "Additional purchase",
      "created_at": "2024-02-01T14:20:00.000Z"
    }
  ],
  "count": 2
}
```

## Swagger Documentation

Access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

Navigate to **Security Holdings** section and find the endpoint:
- `GET /holdings/securities/{id}/transactions`

You can test it directly from the Swagger UI.

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid holding ID"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied to this holding"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Holding not found"
}
```

## Using with Postman

1. Create a new GET request
2. URL: `http://localhost:3000/api/holdings/securities/{holding_id}/transactions`
3. Add Authorization header:
   - Type: Bearer Token
   - Token: Your JWT token
4. Send the request

## Testing Scenarios

### Scenario 1: Valid Holding with Multiple Transactions
- Expected: 200 OK with array of transactions
- Ordered by transaction_date descending (most recent first)

### Scenario 2: Valid Holding with No Transactions
- Expected: 200 OK with empty array
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

### Scenario 3: Non-existent Holding ID
- Expected: 404 Not Found

### Scenario 4: Holding Belonging to Another User
- Expected: 403 Forbidden

### Scenario 5: Invalid Holding ID (non-numeric)
- Expected: 400 Bad Request

