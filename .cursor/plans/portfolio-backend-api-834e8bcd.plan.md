<!-- 834e8bcd-45d1-4432-8e47-091d245469e0 4754cf28-db1b-4193-a9dd-f894e1ed8534 -->
# Portfolio Management Backend API

## Project Structure

Create a `backend/` directory with the following structure:

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # Drizzle DB connection
│   │   └── env.ts            # Environment variables
│   ├── db/
│   │   └── schema.ts         # Drizzle schema definitions
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication middleware
│   │   ├── errorHandler.ts  # Global error handler
│   │   └── validator.ts     # Request validation middleware
│   ├── routes/
│   │   ├── auth.routes.ts    # Auth endpoints (login, register)
│   │   └── portfolio.routes.ts # Portfolio CRUD endpoints
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── portfolio.controller.ts
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces/types
│   ├── utils/
│   │   ├── jwt.ts            # JWT helpers
│   │   └── swagger.ts        # Swagger configuration
│   ├── app.ts                # Express app setup
│   └── server.ts             # Entry point
├── package.json
├── tsconfig.json
├── .env.example
├── drizzle.config.ts
└── README.md
```

## Implementation Steps

### 1. Initialize Project & Dependencies

**Create `backend/package.json`** with dependencies:

- express, @types/express
- typescript, ts-node, tsx
- drizzle-orm, drizzle-kit, pg, @types/pg
- jsonwebtoken, @types/jsonwebtoken, bcrypt, @types/bcrypt
- zod (validation)
- dotenv
- swagger-ui-express, @types/swagger-ui-express
- cors, @types/cors

**Create `tsconfig.json`** with strict TypeScript configuration targeting ES2020, with paths configured for clean imports.

### 2. Drizzle ORM Schema Setup

**File: `src/db/schema.ts`**

Define Drizzle schema tables mirroring the PostgreSQL database:

- `users` table - from `schema/01_users.sql`
- `portfolio_summary` table - from `schema/05_portfolio.sql` (lines 6-18)
- Additional tables as needed for relationships

**File: `drizzle.config.ts`**

Configure Drizzle to connect to the existing PostgreSQL database:

- Database: `portfolio_management`
- Host: `localhost:5432`
- User: `portfolio_user`
- Schema output: `./src/db/schema.ts`

**File: `src/config/database.ts`**

Create Drizzle connection instance using `drizzle()`  with postgres connection pool.

### 3. Authentication System

**File: `src/controllers/auth.controller.ts`**

Implement:

- `register()` - Create new user with bcrypt password hashing
- `login()` - Validate credentials, return JWT token

**File: `src/utils/jwt.ts`**

Helper functions:

- `generateToken(userId, email)` - Create JWT with 24h expiration
- `verifyToken(token)` - Decode and validate JWT

**File: `src/middleware/auth.ts`**

Middleware to:

- Extract JWT from `Authorization: Bearer <token>` header
- Verify token and attach `req.user` with `userId` and `email`
- Return 401 for invalid/missing tokens

**File: `src/routes/auth.routes.ts`**

Routes:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### 4. Portfolio Summary CRUD Endpoints

**File: `src/controllers/portfolio.controller.ts`**

Implement business logic with Drizzle queries:

- `getAllPortfolios()` - Get all portfolio_summary records for authenticated user
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Query: `SELECT * FROM portfolio_summary WHERE user_id = req.user.userId`

- `getPortfolioById(id)` - Get specific portfolio summary by `summary_id`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Query with ownership check (user_id must match authenticated user)

- `createPortfolio()` - Insert new portfolio_summary record
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Validate: asset_type (enum), user_id (from auth), numeric fields

- `updatePortfolio(id)` - Update existing portfolio summary
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Validate ownership, update fields, set `last_updated` timestamp

- `deletePortfolio(id)` - Delete portfolio summary
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Validate ownership before deletion

**File: `src/routes/portfolio.routes.ts`**

Protected routes (all require auth middleware):

- `GET /portfolios` → getAllPortfolios
- `GET /portfolios/:id` → getPortfolioById
- `POST /portfolios` → createPortfolio
- `PUT /portfolios/:id` → updatePortfolio
- `DELETE /portfolios/:id` → deletePortfolio

### 5. Validation & Error Handling

**File: `src/middleware/validator.ts`**

Use Zod schemas to validate:

- Portfolio creation: `{ user_id, asset_type, total_investment, current_value, ... }`
- Portfolio update: partial schema
- Auth: `{ email, password, username, ... }`

**File: `src/middleware/errorHandler.ts`**

Global error handler returning consistent JSON:

```typescript
{
  success: false,
  error: string,
  statusCode: number
}
```

Handle common errors: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (server error).

### 6. API Documentation

**File: `src/utils/swagger.ts`**

OpenAPI 3.0 specification with:

- **Security scheme**: JWT Bearer token
- **Schemas**: User, PortfolioSummary, ErrorResponse, LoginRequest, RegisterRequest
- **Tags**: Auth, Portfolio

**Swagger UI**: Serve at `/api-docs`

**JSDoc comments**: Add detailed documentation to all controller functions with:

```typescript
/**
 * @swagger
 * /portfolios:
 *   get:
 *     summary: Get all portfolio summaries for authenticated user
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses: ...
 */
```

### 7. Application Setup

**File: `src/app.ts`**

Configure Express app:

- CORS middleware
- JSON body parser
- Request logging
- Routes: `/auth/*`, `/portfolios/*`
- Swagger UI at `/api-docs`
- Error handler (last middleware)

**File: `src/server.ts`**

Entry point:

- Load environment variables
- Start Express on port 3000 (or from env)
- Database connection test

**File: `.env.example`**

Template for:

```
DATABASE_URL=postgresql://portfolio_user:portfolio_password@localhost:5432/portfolio_management
JWT_SECRET=your_secret_key_here
PORT=3000
NODE_ENV=development
```

### 8. TypeScript Types

**File: `src/types/index.ts`**

Define interfaces:

- `User` - user object from DB
- `PortfolioSummary` - portfolio_summary table structure
- `JWTPayload` - decoded token structure
- `AuthRequest` - extends Express Request with `user` property
- Request/Response DTOs for each endpoint

### 9. Documentation

**File: `backend/README.md`**

Include:

- Project overview
- Prerequisites (Node.js, PostgreSQL running via docker-compose)
- Installation steps (`npm install`, environment setup)
- Run instructions (`npm run dev`)
- API endpoint documentation with example curl commands
- Database connection details
- Swagger UI URL

## Implementation Todos

The following tasks will be completed in order:

1. **Project scaffolding** - Initialize npm, install dependencies, create directory structure
2. **Drizzle schema & database** - Define schema, configure Drizzle, establish DB connection
3. **Authentication system** - Implement JWT auth, register/login endpoints with bcrypt
4. **Portfolio CRUD** - Build all 5 portfolio endpoints with Drizzle queries
5. **Validation & error handling** - Add Zod validation and global error middleware
6. **API documentation** - Integrate Swagger UI and add comprehensive JSDoc comments
7. **Testing & finalization** - Create README, test all endpoints, document example requests

## Key Technical Decisions

- **Database**: Connect to existing PostgreSQL (`portfolio_management`) via Drizzle ORM
- **Auth**: JWT tokens (24h expiration), bcrypt password hashing
- **Validation**: Zod schemas for type-safe request validation
- **Documentation**: Swagger UI + JSDoc for comprehensive API docs
- **Port**: Default 3000 (configurable via env)
- **CORS**: Enabled for frontend integration

### To-dos

- [ ] Initialize backend project with yarn, TypeScript, and install all dependencies
- [ ] Configure Drizzle ORM with schema definitions and database connection
- [ ] Implement JWT authentication system with register/login endpoints
- [ ] Build portfolio CRUD endpoints with controllers and routes
- [ ] Add Zod validation middleware and global error handling
- [ ] Integrate Swagger UI and add comprehensive JSDoc documentation
- [ ] Create README with setup instructions and API usage examples