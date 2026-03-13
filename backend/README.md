# CipherSQLStudio — Backend

Express 5 + TypeScript REST API with PostgreSQL, JWT authentication, sandboxed SQL execution, and Gemini AI hint generation.

---

**Navigation:** [← Root README](../README.md) | [Frontend README →](../frontend/README.md)

> **Live:** [cipher-sql-studio-gaurav.vercel.app](https://cipher-sql-studio-gaurav.vercel.app/)

---

## Quick Start

```bash
npm install
cp .env.example .env        # Configure your environment variables
npm run db:init              # Initialize database schema + seed data
npm run dev                  # Start dev server on http://localhost:5000
```

---

## Module Architecture

The backend follows a modular architecture where each feature is encapsulated as a module with its own types, service, controller, and routes.

```
src/
├── config/
│   ├── db.ts               # PostgreSQL Pool singleton
│   └── env.ts              # Environment config (frozen object)
├── middlewares/
│   ├── auth.middleware.ts   # JWT token verification
│   └── error.middleware.ts  # Global error handler
├── modules/
│   ├── index.routes.ts     # Route aggregator (/api/v1)
│   ├── auth/               # User authentication
│   ├── assignments/        # SQL assignments CRUD
│   ├── query/              # Sandboxed query execution
│   └── hints/              # AI-powered SQL hints
├── utils/
│   ├── apiHandler.ts       # ApiResponse & ApiError classes
│   ├── asyncHandler.ts     # Async route error wrapper
│   └── sanitizeQuery.ts    # SQL sanitization & validation
├── app.ts                  # Express app configuration
└── server.ts               # HTTP server entry
```

### Request Flow

```
Client Request
  → CORS middleware
  → JSON body parser
  → Router (/api/v1)
    → Auth routes (public: register, login)
    → requireAuth middleware (for protected routes)
    → Module controller
      → Module service (business logic)
        → PostgreSQL / Gemini AI
      → ApiResponse
  → Error middleware (catch-all)
```

---

## Modules

### Auth Module (`/api/v1/auth`)

Handles user registration, login, and token validation.

| File                 | Responsibility                                         |
| -------------------- | ------------------------------------------------------ |
| `auth.types.ts`      | `RegisterRequest`, `LoginRequest`, `AuthUser`, `AuthResponse` |
| `auth.service.ts`    | Password hashing (bcrypt), user CRUD, JWT signing      |
| `auth.controller.ts` | Request validation, calls service, sends response      |
| `auth.routes.ts`     | Route definitions: POST /register, POST /login, GET /me|

**Service methods:**
- `register(name, email, password)` — Hashes password, inserts user, returns user + JWT
- `login(email, password)` — Verifies credentials, returns user + JWT
- `getMe(userId)` — Returns user profile by ID
- `signToken(userId)` — Creates JWT with `{userId}` payload

**Endpoints:**

#### POST `/auth/register`
```json
// Request
{ "name": "John", "email": "john@example.com", "password": "secret123" }

// Response 201
{ "statusCode": 201, "message": "Registered successfully",
  "data": { "user": { "id": 1, "name": "John", "email": "john@example.com" }, "token": "eyJ..." },
  "success": true }
```
Errors: `400` (missing fields, password < 6 chars), `409` (email taken)

#### POST `/auth/login`
```json
// Request
{ "email": "john@example.com", "password": "secret123" }

// Response 200
{ "statusCode": 200, "message": "Login successful",
  "data": { "user": {...}, "token": "eyJ..." }, "success": true }
```
Errors: `400` (missing fields), `401` (invalid credentials)

#### GET `/auth/me` (requires `Authorization: Bearer <token>`)
```json
// Response 200
{ "statusCode": 200, "message": "User fetched",
  "data": { "id": 1, "name": "John", "email": "john@example.com", "created_at": "..." },
  "success": true }
```

---

### Assignments Module (`/api/v1/assignments`)

CRUD for SQL learning assignments with associated table schemas and sample data.

| File                       | Responsibility                                    |
| -------------------------- | ------------------------------------------------- |
| `assignments.types.d.ts`   | `Assignment`, `ColumnDef`, `AssignmentTable`, `AssignmentSampleData`, `AssignmentDetail` |
| `assignments.service.ts`   | Database queries for assignments + related tables  |
| `assignments.controller.ts`| Route handlers                                     |
| `assignments.routes.ts`    | GET /, GET /:id                                    |

**Service methods:**
- `getAllAssignments()` — Returns all assignments (id, title, description, difficulty, question, created_at)
- `getAssignmentById(id)` — Returns assignment + tables (with JSONB `columns`) + sample data (with JSONB `rows`) via `Promise.all`

**Endpoints:**

#### GET `/assignments`
Returns array of all assignments with basic fields.

#### GET `/assignments/:id`
Returns full assignment detail including:
- `tables[]` — Table schemas with `columns` JSONB (`[{columnName, dataType}]`)
- `sample_data[]` — Sample data with `rows` JSONB (array of row objects)

---

### Query Module (`/api/v1/query`)

Executes user SQL queries in isolated PostgreSQL sandbox schemas.

| File                 | Responsibility                                        |
| -------------------- | ----------------------------------------------------- |
| `query.types.ts`     | `ExecuteQueryRequest`, `QueryResult`                  |
| `query.service.ts`   | Sandbox lifecycle, query execution, result formatting |
| `query.controller.ts`| Input validation, calls service                       |
| `query.routes.ts`    | POST /execute                                         |

**Sandbox lifecycle:**

```
1. CREATE SCHEMA sandbox_{timestamp}_{randomHex}
2. SET search_path TO sandbox_..., public
3. Execute assignment's CREATE TABLE statements
4. Execute assignment's INSERT statements
5. Run user's sanitized SELECT query
6. Return { rows, rowCount, fields }
7. DROP SCHEMA sandbox_... CASCADE  (in finally block — always runs)
```

**Endpoint:**

#### POST `/query/execute`
```json
// Request
{ "query": "SELECT * FROM users WHERE age > 25", "assignment_id": 2 }

// Response 200
{ "statusCode": 200, "message": "Query executed successfully",
  "data": { "rows": [...], "rowCount": 3, "fields": ["id", "name", "age", "email"] },
  "success": true }
```
Errors: `400` (empty query, non-SELECT, forbidden keyword, multi-statement, SQL syntax error)

---

### Hints Module (`/api/v1/hints`)

Generates AI-powered SQL hints using Google Gemini.

| File                 | Responsibility                                    |
| -------------------- | ------------------------------------------------- |
| `hints.types.ts`     | `HintRequest`, `HintResponse`                    |
| `hints.service.ts`   | Gemini API integration, prompt construction       |
| `hints.controller.ts`| Input validation, calls service                   |
| `hints.routes.ts`    | POST /                                            |

**Gemini configuration:**
- Model: `gemini-2.0-flash` (configurable via `GEMINI_MODEL`)
- Temperature: `0.7`
- Max output tokens: `300`
- System instruction: SQL tutor role — gives hints, never full answers

**Endpoint:**

#### POST `/hints`
```json
// Request
{ "question": "List all orders with customer name",
  "query": "SELECT * FROM orders",
  "schema": "CREATE TABLE customers (...); CREATE TABLE orders (...)" }

// Response 200
{ "statusCode": 200, "message": "Hint generated successfully",
  "data": { "hint": "Think about which SQL clause combines rows from two tables..." },
  "success": true }
```

---

## Middleware

### `requireAuth`

JWT verification middleware applied to all routes except auth endpoints.

```
Authorization: Bearer <jwt_token>
  → Extract token from header
  → jwt.verify(token, JWT_SECRET)
  → Attach decoded.userId to req.userId
  → next()
```

Returns `401` if token is missing, expired, or invalid.

### `errorMiddleware`

Global Express error handler:
- If error has a `statusCode` (from `ApiError`), returns that status + message
- If error is a generic 500, returns `"Internal server error"` (no stack trace leak)

---

## Utilities

### `ApiResponse`

Standardized success response:
```typescript
new ApiResponse(200, "Success message", data)
// → { statusCode: 200, message: "Success message", data: {...}, success: true }
```

### `ApiError`

Custom error class with HTTP status code:
```typescript
throw new ApiError(404, "Assignment not found")
// → Caught by errorMiddleware → { statusCode: 404, error: "Assignment not found" }
```

### `asyncHandler`

Wraps async route handlers to automatically forward rejected promises to `next()`.

### `sanitizeQuery`

SQL validation pipeline:
1. Strip `--` and `/* */` comments
2. Trim whitespace
3. Reject empty queries
4. Verify starts with `SELECT`
5. Block forbidden keywords (word-boundary regex): `DROP`, `DELETE`, `UPDATE`, `ALTER`, `INSERT`, `TRUNCATE`
6. Reject multi-statement queries (`;` followed by more SQL)

---

## Database

### Connection

Uses `pg.Pool` with a single connection string from `DB_URI` environment variable.

### Initialization

```bash
npm run db:init    # Runs sql/init.js → executes sql/init.sql
```

Creates 5 tables and seeds 3 sample assignments:
1. **Select All Users** (easy) — `SELECT *` from users table
2. **Filter by Age** (easy) — `WHERE` clause with `age > 25`
3. **Join Orders** (medium) — `JOIN` customers with orders

### JSONB Columns

- `assignment_tables.columns` — `[{columnName: string, dataType: string}]`
- `assignment_sample_data.rows` — Array of row data objects

---

## Environment Variables

| Variable        | Required | Default                  | Description                   |
| --------------- | -------- | ------------------------ | ----------------------------- |
| `DB_URI`        | Yes      | —                        | PostgreSQL connection string  |
| `PORT`          | Yes      | —                        | Server port                   |
| `JWT_SECRET`    | Yes      | `change-me-in-production`| JWT signing secret            |
| `JWT_EXPIRES_IN`| No       | `7d`                     | Token expiry duration         |
| `GEMINI_API_KEY`| Yes      | —                        | Google Gemini API key         |
| `GEMINI_MODEL`  | No       | `gemini-2.0-flash`       | Gemini model name             |
| `CORS_ORIGIN`   | No       | —                        | Allowed CORS origins          |

---

## Scripts

| Script         | Command                   | Description                          |
| -------------- | ------------------------- | ------------------------------------ |
| `dev`          | `tsx watch src/server.ts` | Dev server with hot reload           |
| `build`        | `tsc && tsc-alias`        | Compile TS + resolve `@/` aliases    |
| `start`        | `node dist/server.js`     | Run compiled production build        |
| `db:init`      | `node sql/init.js`        | Run database initialization script   |

---

## Path Aliases

`@/` maps to `src/` — resolved by `tsx` at dev time and `tsc-alias` at build time.

```typescript
import { pool } from "@/config/db";
import { ApiError } from "@/utils/apiHandler";
```

---

## Error Handling Strategy

```
Controller validates input
  ├── Missing field? → throw new ApiError(400, "message")
  ├── Service layer
  │     ├── Business error → throw new ApiError(4xx, "message")
  │     ├── SQL error → catch & throw new ApiError(400, sqlError.message)
  │     └── Success → return data
  └── asyncHandler catches unhandled throws
            └── errorMiddleware
                  ├── ApiError → { statusCode, error: message }
                  └── Unknown → { statusCode: 500, error: "Internal server error" }
```
