# CipherSQLStudio

A browser-based SQL learning platform where users practice SQL queries against predefined assignments, get AI-powered hints, and see instant results — all inside an interactive, sandboxed environment.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Tech Stack](https://img.shields.io/badge/Express-5-green) ![Tech Stack](https://img.shields.io/badge/PostgreSQL-16-blue) ![Tech Stack](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tech Stack](https://img.shields.io/badge/Gemini_AI-2.0-orange)

---

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Open%20App-brightgreen?style=for-the-badge)](https://cipher-sql-studio-gaurav.vercel.app/)

> **Live URL:** [https://cipher-sql-studio-gaurav.vercel.app/](https://cipher-sql-studio-gaurav.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Query Sandbox Isolation](#query-sandbox-isolation)
- [AI Hint System](#ai-hint-system)
- [Frontend Architecture](#frontend-architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts Reference](#scripts-reference)
- [Security](#security)
- [Contributing](#contributing)

---

## Overview

CipherSQLStudio is a full-stack SQL learning application that provides:

- **Curated SQL Assignments** — Difficulty-graded problems (easy/medium/hard) with schema definitions, sample data, and expected outputs.
- **Interactive SQL Editor** — Monaco Editor (VS Code's editor) with SQL syntax highlighting and auto-completion.
- **Sandboxed Query Execution** — Each query runs in an isolated PostgreSQL schema that is created on-the-fly and destroyed after execution, preventing any data pollution.
- **AI-Powered Hints** — Gemini AI provides progressive hints without giving away the answer, acting as a virtual SQL tutor.
- **JWT Authentication** — Secure email + password registration/login with protected routes.
- **Real-time Results** — Query results displayed in a formatted table with row counts and meaningful SQL error messages.

---

## Screenshots

### Home — Assignment List
![Home](screen/home.png)

### Assignment Workspace
![Query Editor](screen/query.png)

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                        │
│                                                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐   │
│  │   Auth   │  │ Assignment   │  │   SQL    │  │   Hint    │   │
│  │  Pages   │  │   Pages      │  │  Editor  │  │   Panel   │   │
│  └────┬─────┘  └──────┬───────┘  └────┬─────┘  └─────┬─────┘   │
│       │               │               │              │         │
│       └───────────┬───┴───────────────┴──────────────┘         │
│                   │                                            │
│            ┌──────┴──────┐                                     │
│            │  API Layer  │  (Axios + JWT Interceptor)          │
│            └──────┬──────┘                                     │
└───────────────────┼────────────────────────────────────────────┘
                    │ HTTP (Vite Proxy /api → :5000)
┌───────────────────┼────────────────────────────────────────────┐
│                   │          BACKEND (Express)                 │
│            ┌──────┴──────┐                                     │
│            │   Router    │                                     │
│            └──────┬──────┘                                     │
│     ┌─────────────┼─────────────┬──────────────┐               │
│     │             │             │              │               │
│ ┌───┴───┐  ┌─────┴─────┐  ┌───┴───┐  ┌──────┴──────┐           │
│ │ Auth  │  │Assignments│  │ Query │  │    Hints    │           │
│ │Module │  │  Module   │  │Module │  │   Module    │           │
│ └───┬───┘  └─────┬─────┘  └───┬───┘  └──────┬──────┘           │
│     │            │             │              │                │
│     └────────────┴──────┬──────┘              │                │
│                         │                     │                │
│                  ┌──────┴──────┐       ┌──────┴──────┐         │
│                  │ PostgreSQL  │       │  Gemini AI  │         │
│                  │  Database   │       │     API     │         │
│                  └─────────────┘       └─────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology                                                               |
| ---------- | ------------------------------------------------------------------------ |
| Frontend   | React 19, Vite 7, TypeScript 5.9, SCSS, Monaco Editor, React Router 7   |
| Backend    | Node.js, Express 5, TypeScript 5.9, PostgreSQL (`pg`), JWT, bcrypt       |
| AI         | Google Gemini API (`@google/genai`) — gemini-2.0-flash                   |
| Database   | PostgreSQL 16+ with JSONB columns                                        |
| Auth       | JWT (jsonwebtoken) + bcrypt password hashing                             |
| Dev Tools  | tsx (watch mode), tsc-alias (path resolution), Vite dev proxy            |

---

## Project Structure

```
CipherSQLStudio/
├── backend/
│   ├── sql/
│   │   ├── init.sql              # Database schema + seed data
│   │   └── init.js               # Node.js script to run init.sql
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts             # PostgreSQL connection pool
│   │   │   └── env.ts            # Environment variable configuration
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts # JWT verification middleware
│   │   │   └── error.middleware.ts# Global error handler
│   │   ├── modules/
│   │   │   ├── index.routes.ts   # Central route aggregator
│   │   │   ├── auth/             # Authentication module
│   │   │   │   ├── auth.types.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── assignments/      # Assignments module
│   │   │   │   ├── assignments.types.d.ts
│   │   │   │   ├── assignments.service.ts
│   │   │   │   ├── assignments.controller.ts
│   │   │   │   └── assignments.routes.ts
│   │   │   ├── query/            # Query execution module
│   │   │   │   ├── query.types.ts
│   │   │   │   ├── query.service.ts
│   │   │   │   ├── query.controller.ts
│   │   │   │   └── query.routes.ts
│   │   │   └── hints/            # AI hints module
│   │   │       ├── hints.types.ts
│   │   │       ├── hints.service.ts
│   │   │       ├── hints.controller.ts
│   │   │       └── hints.routes.ts
│   │   ├── utils/
│   │   │   ├── apiHandler.ts     # ApiResponse & ApiError classes
│   │   │   ├── asyncHandler.ts   # Async route wrapper
│   │   │   └── sanitizeQuery.ts  # SQL query sanitization
│   │   ├── app.ts                # Express app setup
│   │   └── server.ts             # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── GuestRoute/       # Redirects logged-in users away from auth pages
    │   │   ├── HintPanel/        # AI hint request & display
    │   │   ├── Layout/           # App shell with Navbar + Outlet
    │   │   ├── Navbar/           # Top navigation bar
    │   │   ├── ProtectedRoute/   # Redirects unauthenticated users to login
    │   │   ├── ResultsPanel/     # Query results table
    │   │   ├── SQLEditor/        # Monaco-based SQL editor
    │   │   └── SampleDataViewer/ # Schema & sample data table viewer
    │   ├── context/
    │   │   └── AuthContext.tsx    # Authentication state management
    │   ├── pages/
    │   │   ├── Auth/             # Login & Register pages
    │   │   ├── AssignmentList/   # Assignment grid listing
    │   │   └── AssignmentDetail/ # Full assignment workspace
    │   ├── services/
    │   │   └── api.ts            # Axios HTTP client + interceptors
    │   ├── styles/               # SCSS variables, mixins, reset
    │   ├── types/
    │   │   └── index.ts          # Shared TypeScript interfaces
    │   ├── App.tsx               # Route definitions
    │   └── main.tsx              # App entry point
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.app.json
```

> **Sub-project documentation:**
> - [Backend README](backend/README.md) — Express API, modules, environment setup
> - [Frontend README](frontend/README.md) — React architecture, Vite config, component guide
> - **Live App:** [cipher-sql-studio-gaurav.vercel.app](https://cipher-sql-studio-gaurav.vercel.app/)

---

## Database Schema

### Entity Relationship Diagram

![Database Schema](screen/database-schema.png)


## API Reference

All API routes are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint          | Auth     | Description                  |
| ------ | ----------------- | -------- | ---------------------------- |
| POST   | `/auth/register`  | Public   | Register a new user          |
| POST   | `/auth/login`     | Public   | Login with email & password  |
| GET    | `/auth/me`        | Required | Get current user profile     |

#### POST `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "message": "Registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2026-03-12T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "success": true
}
```

**Error Responses:**
- `400` — Missing fields or password < 6 characters
- `409` — Email already registered

#### POST `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "created_at": "..." },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "success": true
}
```

**Error Responses:**
- `400` — Missing email or password
- `401` — Invalid email or password

#### GET `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "User fetched",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-03-12T10:00:00.000Z"
  },
  "success": true
}
```

---

### Assignments

> All assignment endpoints require JWT authentication.

| Method | Endpoint            | Description                              |
| ------ | ------------------- | ---------------------------------------- |
| GET    | `/assignments`      | List all assignments                     |
| GET    | `/assignments/:id`  | Get assignment details with schema & data|

#### GET `/assignments`

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Assignments retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Select All Users",
      "description": "Practice selecting all rows from a users table.",
      "difficulty": "easy",
      "question": "Write a query to select all columns from the \"users\" table.",
      "created_at": "2026-03-12T10:00:00.000Z"
    }
  ],
  "success": true
}
```

#### GET `/assignments/:id`

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Assignment details retrieved successfully",
  "data": {
    "id": 3,
    "title": "Join Orders",
    "difficulty": "medium",
    "question": "Write a query to list all orders along with the customer name.",
    "tables": [
      {
        "id": 3,
        "table_name": "customers",
        "columns": [
          { "columnName": "id", "dataType": "INTEGER" },
          { "columnName": "name", "dataType": "TEXT" }
        ],
        "schema_sql": "CREATE TABLE IF NOT EXISTS customers (...)"
      }
    ],
    "sample_data": [
      {
        "id": 3,
        "table_name": "customers",
        "rows": [
          { "id": 1, "name": "Alice", "email": "alice@example.com" }
        ]
      }
    ]
  },
  "success": true
}
```

---

### Query Execution

| Method | Endpoint          | Auth     | Description                |
| ------ | ----------------- | -------- | -------------------------- |
| POST   | `/query/execute`  | Required | Execute a SQL query        |

#### POST `/query/execute`

**Request Body:**
```json
{
  "query": "SELECT c.name, o.product FROM customers c JOIN orders o ON c.id = o.customer_id",
  "assignment_id": 3
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Query executed successfully",
  "data": {
    "rows": [
      { "name": "Alice", "product": "Laptop" },
      { "name": "Bob", "product": "Phone" }
    ],
    "rowCount": 2,
    "fields": ["name", "product"]
  },
  "success": true
}
```

**Error Responses:**
- `400` — Empty query, non-SELECT statement, forbidden keyword, multi-statement, or SQL syntax error
- `401` — Authentication required

---

### Hints (AI-Powered)

| Method | Endpoint   | Auth     | Description               |
| ------ | ---------- | -------- | ------------------------- |
| POST   | `/hints`   | Required | Get an AI-generated hint  |

#### POST `/hints`

**Request Body:**
```json
{
  "question": "Write a query to list all orders along with the customer name.",
  "query": "SELECT * FROM orders",
  "schema": "CREATE TABLE customers (id SERIAL PRIMARY KEY, name VARCHAR(100));\nCREATE TABLE orders (id SERIAL PRIMARY KEY, customer_id INT REFERENCES customers(id));"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Hint generated successfully",
  "data": {
    "hint": "You're on the right track! To get data from both tables, you'll need to use a JOIN. Think about which column connects customers to orders..."
  },
  "success": true
}
```

---

## Authentication Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │                    │ Database │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │  POST /auth/register          │                               │
     │  {name, email, password}      │                               │
     │──────────────────────────────>│                               │
     │                               │  Check email uniqueness       │
     │                               │──────────────────────────────>│
     │                               │<──────────────────────────────│
     │                               │                               │
     │                               │  bcrypt.hash(password, 10)    │
     │                               │  INSERT INTO users            │
     │                               │──────────────────────────────>│
     │                               │<──────────────────────────────│
     │                               │                               │
     │                               │  jwt.sign({userId}, secret)   │
     │  {user, token}                │                               │
     │<──────────────────────────────│                               │
     │                               │                               │
     │  Store token in localStorage  │                               │
     │                               │                               │
     │  GET /assignments             │                               │
     │  Authorization: Bearer <token>│                               │
     │──────────────────────────────>│                               │
     │                               │  jwt.verify(token, secret)    │
     │                               │  → req.userId = decoded.userId│
     │                               │                               │
     │                               │  Query database               │
     │                               │──────────────────────────────>│
     │  {assignments data}           │<──────────────────────────────│
     │<──────────────────────────────│                               │
```

**Key Details:**
- Passwords are hashed with **bcrypt** (10 salt rounds) before storage
- JWT tokens are signed with `HS256` using `JWT_SECRET` env variable
- Token expiry defaults to **7 days** (configurable via `JWT_EXPIRES_IN`)
- Token is stored in `localStorage` and attached to every request via an Axios request interceptor
- On app mount, `AuthContext` validates the stored token by calling `GET /auth/me`

---

## Query Sandbox Isolation

The most critical feature — every user query runs in a **completely isolated PostgreSQL schema**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Query Execution Flow                       │
│                                                               │
│  1. CREATE SCHEMA sandbox_1710234567890_a3b2c1               │
│  2. SET search_path TO sandbox_..., public                    │
│  3. Execute assignment CREATE TABLE statements in sandbox     │
│  4. Execute assignment INSERT statements in sandbox           │
│  5. Run user's SELECT query against sandbox tables            │
│  6. Return results                                            │
│  7. DROP SCHEMA sandbox_... CASCADE  (always, in finally)     │
│                                                               │
│  ⚡ Each query gets a fresh, disposable environment           │
│  🛡️ Schema name: sandbox_{timestamp}_{random}                │
│  🧹 Cleanup guaranteed via try/finally                        │
└─────────────────────────────────────────────────────────────┘
```

**Query Sanitization** (runs before sandbox creation):
1. Strips SQL comments (`--` and `/* */`)
2. Verifies query starts with `SELECT`
3. Blocks forbidden keywords: `DROP`, `DELETE`, `UPDATE`, `ALTER`, `INSERT`, `TRUNCATE`
4. Rejects multi-statement queries (`;` followed by more SQL)
5. Uses word-boundary regex to avoid false positives (e.g., `updated_at` won't trigger `UPDATE`)

---

## AI Hint System

The hint system uses **Google Gemini AI** to provide progressive SQL tutoring:

```
┌──────────────────────────────────────────────────────────┐
│                    Hint Generation                        │
│                                                           │
│  Input:                                                   │
│  ├── Question: "List all orders with customer name"       │
│  ├── Student's Query: "SELECT * FROM orders"              │
│  └── Schema: CREATE TABLE statements                      │
│                                                           │
│  System Prompt:                                           │
│  "You are a SQL tutor. Given the student's question,      │
│   their attempted query, and the table schema, provide    │
│   a short, helpful hint. Do NOT give the full answer."    │
│                                                           │
│  Config:                                                  │
│  ├── Model: gemini-2.0-flash                              │
│  ├── Temperature: 0.7                                     │
│  └── Max Tokens: 300                                      │
│                                                           │
│  Output: A guiding hint (not the answer)                  │
└──────────────────────────────────────────────────────────┘
```

**Frontend behavior:**
- Multiple hints can be requested — each one stacks as "Hint 1", "Hint 2", etc.
- Button label changes from "Get Hint" to "Get Another Hint" after the first one
- Errors in the hint panel don't hide the retry button

---

## Frontend Architecture

### Routing

| Route              | Component        | Guard          | Description              |
| ------------------ | ---------------- | -------------- | ------------------------ |
| `/login`           | Login            | GuestRoute     | Sign in page             |
| `/register`        | Register         | GuestRoute     | Registration page        |
| `/`                | AssignmentList   | ProtectedRoute | Assignment grid          |
| `/assignment/:id`  | AssignmentDetail | ProtectedRoute | Full assignment workspace|

### Route Guards

- **ProtectedRoute** — If no authenticated user, redirects to `/login`
- **GuestRoute** — If already authenticated, redirects to `/`
- Both show a loading state while `AuthContext` validates the token on mount

### Component Hierarchy

```
<BrowserRouter>
  <AuthProvider>                        ← Auth state management
    <Routes>
      <GuestRoute> → <Login />         ← Public only
      <GuestRoute> → <Register />      ← Public only
      <ProtectedRoute>                  ← Auth required
        <Layout>                        ← Navbar + Outlet
          <AssignmentList />            ← Grid of assignment cards
          <AssignmentDetail>            ← Full workspace
            ├── SampleDataViewer        ← Schema + tabbed sample data
            ├── HintPanel               ← AI hint requests
            ├── SQLEditor               ← Monaco editor
            └── ResultsPanel            ← Query results table
          </AssignmentDetail>
        </Layout>
      </ProtectedRoute>
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### State Management

- **AuthContext** — Global auth state (`user`, `loading`, `login()`, `register()`, `logout()`)
- **Component-local state** — Each page manages its own state via `useState`/`useEffect`
- No external state library needed — the app is intentionally lightweight

### API Layer

The `api.ts` service uses Axios with two interceptors:
1. **Request interceptor** — Attaches `Authorization: Bearer <token>` from localStorage
2. **Response interceptor** — Extracts the real error message from `response.data.error` instead of showing generic Axios errors

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+ (running locally or remote)
- **Google Gemini API key** (for AI hints)

### 1. Clone the repository

```bash
git clone https://github.com/as-ga/cipher-sql-studio.git
cd cipher-sql-studio
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
# Database
DB_URI=postgresql://postgres:your_password@localhost:5432/cipher_sql_studio

# Server
PORT=5000

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

Create the database and initialize tables:

```bash
createdb cipher_sql_studio    # or create via pgAdmin/psql
npm run db:init               # Creates tables + seeds sample data
```

Start the dev server:

```bash
npm run dev                   # Starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev                   # Starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Required | Default                  | Description                        |
| --------------- | -------- | ------------------------ | ---------------------------------- |
| `DB_URI`        | Yes      | —                        | PostgreSQL connection string       |
| `PORT`          | Yes      | —                        | Server port                        |
| `JWT_SECRET`    | Yes      | `change-me-in-production`| Secret key for JWT signing         |
| `JWT_EXPIRES_IN`| No       | `7d`                     | Token expiry duration              |
| `GEMINI_API_KEY`| Yes      | —                        | Google Gemini API key              |
| `GEMINI_MODEL`  | No       | `gemini-2.0-flash`       | Gemini model to use                |
| `CORS_ORIGIN`   | No       | —                        | Comma-separated allowed origins    |

### Frontend

| Variable            | Location        | Description                    |
| ------------------- | --------------- | ------------------------------ |
| Vite proxy          | `vite.config.ts`| `/api` → `http://localhost:5000`|

---

## Scripts Reference

### Backend

| Script         | Command                     | Description                          |
| -------------- | --------------------------- | ------------------------------------ |
| `npm run dev`  | `tsx watch src/server.ts`   | Start dev server with hot reload     |
| `npm run build`| `tsc && tsc-alias`          | Compile TS + resolve path aliases    |
| `npm start`    | `node dist/server.js`       | Run production build                 |
| `npm run db:init`| `node sql/init.js`        | Initialize database schema + seed    |

### Frontend

| Script           | Command                    | Description                          |
| ---------------- | -------------------------- | ------------------------------------ |
| `npm run dev`    | `vite`                     | Start Vite dev server on :5173       |
| `npm run build`  | `tsc -b && vite build`     | Type-check + production build        |
| `npm run preview`| `vite preview`             | Preview production build locally     |
| `npm run lint`   | `eslint .`                 | Run ESLint                           |

---

## Security

### Implemented Measures

| Category                  | Implementation                                                     |
| ------------------------- | ------------------------------------------------------------------ |
| **Password Storage**      | bcrypt with 10 salt rounds — never stored in plain text            |
| **Authentication**        | JWT with configurable secret and expiry                            |
| **Route Protection**      | Backend middleware `requireAuth` on all non-auth routes            |
| **SQL Injection Prevention** | Parameterized queries (`$1`, `$2`) for all database operations  |
| **Query Sandboxing**      | Each query runs in an isolated, temporary PostgreSQL schema        |
| **Query Sanitization**    | Blocks DROP/DELETE/UPDATE/ALTER/INSERT/TRUNCATE, enforces SELECT   |
| **Multi-statement Block** | Prevents `;` followed by additional statements                    |
| **Comment Stripping**     | Removes `--` and `/* */` comments before validation                |
| **Error Hiding**          | 500 errors return "Internal server error", not stack traces        |
| **CORS**                  | Configurable origins via `CORS_ORIGIN` env variable                |

### Recommendations for Production

- Set a strong, unique `JWT_SECRET` (min 32 characters)
- Use HTTPS in production
- Set `CORS_ORIGIN` to restrict allowed origins
- Rate-limit the `/auth/login` and `/hints` endpoints
- Add request size limits for query bodies
- Use connection pooling limits for PostgreSQL

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is for educational purposes.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/as-ga">as-ga</a>
</p>