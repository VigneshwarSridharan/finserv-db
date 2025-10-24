# Portfolio Management API

A robust RESTful API backend for managing portfolio summaries built with **Express.js**, **TypeScript**, and **Drizzle ORM**, featuring JWT authentication and comprehensive Swagger documentation.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Security](#security)
- [Development](#development)

## Features

- ✅ **RESTful API** design with Express.js
- ✅ **TypeScript** for type safety
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **Drizzle ORM** for database interactions
- ✅ **Zod** validation for request data
- ✅ **Swagger UI** for interactive API documentation
- ✅ **CORS** enabled for frontend integration
- ✅ **Error handling** with consistent JSON responses
- ✅ **Request logging** middleware
- ✅ **Graceful shutdown** handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI 3.0
- **Development**: tsx (TypeScript executor)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** database running (via docker-compose from parent directory)

The PostgreSQL database should be running from the root project:

```bash
cd ..
docker-compose up -d
```

This starts the database with:
- **Host**: localhost:5432
- **Database**: portfolio_management
- **User**: portfolio_user
- **Password**: portfolio_password

## Installation

1. **Navigate to the backend directory**:

```bash
cd backend
```

2. **Install dependencies**:

```bash
npm install
```

## Configuration

1. **Create environment file**:

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

2. **Configure environment variables** (`.env`):

```env
# Database Configuration
DATABASE_URL=postgresql://portfolio_user:portfolio_password@localhost:5432/portfolio_management
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_management
DB_USER=portfolio_user
DB_PASSWORD=portfolio_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

**⚠️ Important**: Change `JWT_SECRET` to a strong random string in production!

## Running the Application

### Development Mode

Run with hot-reload using tsx:

```bash
npm run dev
```

### Production Build

1. **Build the TypeScript code**:

```bash
npm run build
```

2. **Start the production server**:

```bash
npm start
```

### Verify Server is Running

The server should start on `http://localhost:3000`. You'll see:

```
🔍 Testing database connection...
✅ Database connected successfully at: 2024-10-24T...

=================================================
🚀 Portfolio Management API Server Started
=================================================
📍 Server:        http://localhost:3000
📚 API Docs:      http://localhost:3000/api-docs
🏥 Health Check:  http://localhost:3000/health
🌍 Environment:   development
=================================================
```

## API Documentation

### Swagger UI

Interactive API documentation is available at:

**http://localhost:3000/api-docs**

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality
- JWT authentication support

### Health Check

Check if the server is running:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-10-24T12:00:00.000Z",
  "environment": "development"
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |

### Portfolio Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/portfolios` | Get all portfolios | Yes |
| GET | `/portfolios/:id` | Get portfolio by ID | Yes |
| POST | `/portfolios` | Create new portfolio | Yes |
| PUT | `/portfolios/:id` | Update portfolio | Yes |
| DELETE | `/portfolios/:id` | Delete portfolio | Yes |

## Database Schema

### Users Table

```sql
users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Portfolio Summary Table

```sql
portfolio_summary (
  summary_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  asset_type VARCHAR(50) NOT NULL,
  total_investment DECIMAL(15,2) DEFAULT 0,
  current_value DECIMAL(15,2) DEFAULT 0,
  unrealized_pnl DECIMAL(15,2) DEFAULT 0,
  realized_pnl DECIMAL(15,2) DEFAULT 0,
  total_pnl DECIMAL(15,2) DEFAULT 0,
  percentage_of_portfolio DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, asset_type)
)
```

**Asset Types**: `securities`, `fixed_deposits`, `recurring_deposits`, `gold`, `real_estate`, `other_assets`

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # Drizzle DB connection & pool
│   │   └── env.ts            # Environment variables validation
│   ├── db/
│   │   └── schema.ts         # Drizzle schema definitions
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication middleware
│   │   ├── errorHandler.ts  # Global error handler
│   │   └── validator.ts     # Zod validation middleware
│   ├── routes/
│   │   ├── auth.routes.ts    # Auth endpoints
│   │   └── portfolio.routes.ts # Portfolio CRUD endpoints
│   ├── controllers/
│   │   ├── auth.controller.ts    # Auth logic
│   │   └── portfolio.controller.ts # Portfolio logic
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── utils/
│   │   ├── jwt.ts            # JWT helpers
│   │   └── swagger.ts        # Swagger configuration
│   ├── app.ts                # Express app setup
│   └── server.ts             # Entry point
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── env.example
└── README.md
```

## Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+919876543210"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 3. Create Portfolio Summary

**Note**: Use the JWT token from login/register in the Authorization header.

```bash
curl -X POST http://localhost:3000/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "asset_type": "securities",
    "total_investment": 100000,
    "current_value": 115000,
    "unrealized_pnl": 15000,
    "realized_pnl": 0,
    "total_pnl": 15000,
    "percentage_of_portfolio": 45.5
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary_id": 1,
    "user_id": 1,
    "asset_type": "securities",
    "total_investment": "100000.00",
    "current_value": "115000.00",
    "unrealized_pnl": "15000.00",
    "realized_pnl": "0.00",
    "total_pnl": "15000.00",
    "percentage_of_portfolio": "45.50",
    "last_updated": "2024-10-24T12:00:00.000Z"
  },
  "message": "Portfolio created successfully"
}
```

### 4. Get All Portfolios

```bash
curl -X GET http://localhost:3000/portfolios \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "summary_id": 1,
      "user_id": 1,
      "asset_type": "securities",
      "total_investment": "100000.00",
      "current_value": "115000.00",
      "unrealized_pnl": "15000.00",
      "realized_pnl": "0.00",
      "total_pnl": "15000.00",
      "percentage_of_portfolio": "45.50",
      "last_updated": "2024-10-24T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 5. Get Portfolio by ID

```bash
curl -X GET http://localhost:3000/portfolios/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update Portfolio

```bash
curl -X PUT http://localhost:3000/portfolios/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "current_value": 120000,
    "unrealized_pnl": 20000,
    "total_pnl": 20000
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary_id": 1,
    "user_id": 1,
    "asset_type": "securities",
    "total_investment": "100000.00",
    "current_value": "120000.00",
    "unrealized_pnl": "20000.00",
    "realized_pnl": "0.00",
    "total_pnl": "20000.00",
    "percentage_of_portfolio": "45.50",
    "last_updated": "2024-10-24T12:30:00.000Z"
  },
  "message": "Portfolio updated successfully"
}
```

### 7. Delete Portfolio

```bash
curl -X DELETE http://localhost:3000/portfolios/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "message": "Portfolio deleted successfully"
}
```

## Error Handling

All errors return a consistent JSON structure:

### Validation Error (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "No token provided. Please include Authorization header with Bearer token",
  "statusCode": 401
}
```

### Forbidden (403)

```json
{
  "success": false,
  "error": "Access denied to this portfolio",
  "statusCode": 403
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "Portfolio not found",
  "statusCode": 404
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error",
  "statusCode": 500
}
```

## Security

### Authentication

- **JWT tokens** with 24-hour expiration
- **bcrypt** password hashing with 10 salt rounds
- **Bearer token** authentication for protected routes

### Best Practices

- Passwords are never stored in plain text
- JWT secret should be kept secure and changed in production
- CORS is configured to allow only specific origins
- Input validation using Zod schemas
- SQL injection protection via Drizzle ORM parameterized queries

### Headers

For authenticated requests, include:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## Development

### Useful Commands

```bash
# Install dependencies
npm install

# Run in development mode with hot-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Generate Drizzle migrations (if schema changes)
npm run db:generate

# Run Drizzle migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Adding New Endpoints

1. Define types in `src/types/index.ts`
2. Create controller in `src/controllers/`
3. Add validation schema in `src/middleware/validator.ts`
4. Create route in `src/routes/`
5. Register route in `src/app.ts`
6. Update Swagger docs in `src/utils/swagger.ts`

## Troubleshooting

### Database Connection Failed

**Error**: `❌ Database connection failed`

**Solution**: 
- Ensure PostgreSQL is running: `docker-compose ps`
- Check database credentials in `.env`
- Verify database exists: `psql -U portfolio_user -d portfolio_management -c "SELECT 1"`

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**: 
- Change `PORT` in `.env` file
- Or stop the process using port 3000

### JWT Token Expired

**Error**: `Token expired`

**Solution**: 
- Login again to get a new token
- Tokens expire after 24 hours by default

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
