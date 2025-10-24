# Quick Start Guide

This guide will help you get the Portfolio Management API up and running in less than 5 minutes.

## Prerequisites

✅ Node.js 16+ installed  
✅ PostgreSQL database running (via docker-compose)

## Step 1: Start the Database

From the **project root** directory (not backend/):

```bash
cd /Users/vigneshwarsridharan/Documents/vigneshwar/learning/finserv-db
docker-compose up -d
```

Verify the database is running:

```bash
docker-compose ps
```

You should see `portfolio_db` running on port 5432.

## Step 2: Install Dependencies

Navigate to the backend directory and install packages:

```bash
cd backend
npm install
```

## Step 3: Configure Environment

Copy the environment template:

```bash
cp env.example .env
```

**Optional**: Edit `.env` to customize settings (default values work out of the box).

## Step 4: Start the Server

Run in development mode:

```bash
npm run dev
```

You should see:

```
✅ Database connected successfully at: ...

=================================================
🚀 Portfolio Management API Server Started
=================================================
📍 Server:        http://localhost:3000
📚 API Docs:      http://localhost:3000/api-docs
🏥 Health Check:  http://localhost:3000/health
🌍 Environment:   development
=================================================
```

## Step 5: Test the API

### Option 1: Using Swagger UI (Recommended)

1. Open http://localhost:3000/api-docs in your browser
2. Try out the endpoints interactively
3. Start with `/auth/register` to create a user
4. Then use `/auth/login` to get a JWT token
5. Click "Authorize" and paste your token
6. Now you can test the portfolio endpoints!

### Option 2: Using curl

**Register a user**:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Login**:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

Copy the `token` from the response.

**Create a portfolio** (replace YOUR_TOKEN):

```bash
curl -X POST http://localhost:3000/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "asset_type": "securities",
    "total_investment": 100000,
    "current_value": 115000,
    "unrealized_pnl": 15000,
    "percentage_of_portfolio": 50
  }'
```

**Get all portfolios**:

```bash
curl -X GET http://localhost:3000/portfolios \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Database Connection Error

**Problem**: `❌ Database connection failed`

**Solution**:
```bash
# Check if database is running
docker ps | grep portfolio_db

# If not, start it
cd .. && docker-compose up -d postgres
```

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3000`

**Solution**: Change the port in `.env`:
```env
PORT=3001
```

### Dependencies Installation Failed

**Problem**: `npm install` errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- 📖 Read the full [README.md](./README.md) for detailed documentation
- 🔍 Explore the [Swagger UI](http://localhost:3000/api-docs)
- 🗄️ Check the database schema in `../schema/`
- 🚀 Build your frontend application

## Useful Commands

```bash
# Development with hot-reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## API Endpoints Summary

### Public Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Protected Endpoints (require JWT token)
- `GET /portfolios` - Get all portfolios
- `GET /portfolios/:id` - Get portfolio by ID
- `POST /portfolios` - Create portfolio
- `PUT /portfolios/:id` - Update portfolio
- `DELETE /portfolios/:id` - Delete portfolio

## Support

Having issues? Check the [Troubleshooting section in README.md](./README.md#troubleshooting) or open an issue.

---

**Happy coding!** 🎉

