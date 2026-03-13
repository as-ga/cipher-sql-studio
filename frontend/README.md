# CipherSQLStudio — Frontend

React 19 + Vite 7 + TypeScript single-page application with Monaco SQL Editor, JWT authentication, and a dark-themed responsive UI.

---

**Navigation:** [← Root README](../README.md) | [Backend README →](../backend/README.md)

> **Live:** [cipher-sql-studio-gaurav.vercel.app](https://cipher-sql-studio-gaurav.vercel.app/)

---

## Quick Start

```bash
npm install
npm run dev          # Starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000` (backend).

---

## Architecture

```
src/
├── components/              # Reusable UI components
│   ├── GuestRoute/          # Redirect authenticated users away from auth pages
│   ├── HintPanel/           # AI hint request & accumulator
│   ├── Layout/              # App shell (Navbar + Outlet)
│   ├── Navbar/              # Top navigation + logout
│   ├── ProtectedRoute/      # Redirect unauthenticated users to login
│   ├── ResultsPanel/        # Query results table
│   ├── SQLEditor/           # Monaco Editor wrapper
│   └── SampleDataViewer/    # Tabbed schema + sample data viewer
├── context/
│   └── AuthContext.tsx       # Global authentication state
├── pages/
│   ├── Auth/                # Login & Register pages + shared styles
│   ├── AssignmentList/      # Grid of assignment cards
│   └── AssignmentDetail/    # Full assignment workspace
├── services/
│   └── api.ts               # Axios HTTP client + interceptors
├── styles/                  # Global SCSS (variables, mixins, reset)
├── types/
│   └── index.ts             # Shared TypeScript interfaces
├── App.tsx                  # Route definitions
└── main.tsx                 # Entry point (BrowserRouter + AuthProvider)
```

---

## Routing

| Route              | Page             | Guard          | Description                  |
| ------------------ | ---------------- | -------------- | ---------------------------- |
| `/login`           | Login            | GuestRoute     | Sign in form                 |
| `/register`        | Register         | GuestRoute     | Registration form            |
| `/`                | AssignmentList   | ProtectedRoute | Assignment grid (home)       |
| `/assignment/:id`  | AssignmentDetail | ProtectedRoute | Full SQL workspace           |

### Route Guards

- **ProtectedRoute** — Checks `AuthContext` for an authenticated user. If none, redirects to `/login`. Shows loading spinner while token is being validated.
- **GuestRoute** — If user is already authenticated, redirects to `/`. Prevents logged-in users from seeing login/register pages.

---

## Component Hierarchy

```
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <GuestRoute>
        └── <Login />
        └── <Register />
      <ProtectedRoute>
        └── <Layout>                    ← Navbar + <Outlet />
              ├── <AssignmentList />    ← Card grid
              └── <AssignmentDetail>    ← Two-column workspace
                    ├── SampleDataViewer   (left panel, top)
                    ├── HintPanel          (left panel, bottom)
                    ├── SQLEditor          (right panel, top)
                    └── ResultsPanel       (right panel, bottom)
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

---

## Components

### `SampleDataViewer`

Displays the assignment's table schema and sample data in a tabbed interface.

- **Props**: `tables: AssignmentTable[]`, `sampleData: AssignmentSampleData[]`
- Renders one tab per table
- Column headers from `columns` JSONB (`[{columnName, dataType}]`)
- Row data from `rows` JSONB (array of objects)

### `SQLEditor`

Monaco Editor configured for SQL editing.

- **Props**: `value`, `onChange`, `onRun`, `onClear`
- Language: SQL with syntax highlighting
- Theme: `vs-dark`
- Features: minimap disabled, auto-indent, word wrap
- Action buttons: **Run Query** (green) and **Clear** (outline)

### `ResultsPanel`

Displays query execution results or error messages.

- **Props**: `result: QueryResult | null`, `error: string`
- Success: renders a table with column headers from `fields[]` and data from `rows[]`, plus row count
- Error: renders the error message in a styled error box
- Empty state: "Run a query to see results"

### `HintPanel`

Requests and displays AI-generated hints progressively.

- **Props**: `assignmentId`, `question`, `query`, `schema`
- Accumulates hints in an array (Hint 1, Hint 2, ...)
- Button text: "Get Hint" → "Get Another Hint" after first request
- Loading state with disabled button during API call
- Errors displayed inline without hiding the retry button

### `Navbar`

Top navigation bar with brand link and user actions.

- Brand: "CipherSQLStudio" → links to `/`
- Navigation: "Assignments" link
- Auth: "Logout" button (calls `useAuth().logout()`)

### `Layout`

App shell that renders `<Navbar />` and `<Outlet />` for nested routes.

### `ProtectedRoute` / `GuestRoute`

Route wrapper components using `useAuth()` to control access. Both render `<Outlet />` when their condition is met.

---

## Pages

### Login / Register

- Dark-themed centered card forms
- Email + password (login) or name + email + password (register)
- Error display below the form
- Auto-redirect to `/` on success via `useAuth().login()` / `useAuth().register()`
- Link to toggle between login/register

### AssignmentList

- Grid layout of assignment cards
- Each card shows: title, difficulty badge (color-coded), description
- Click navigates to `/assignment/:id`
- Loading/error states handled

### AssignmentDetail

- Two-column responsive layout
- **Left column**: SampleDataViewer (schema/data) + HintPanel (AI hints)
- **Right column**: SQLEditor (Monaco) + ResultsPanel (results/errors)
- Fetches full assignment detail on mount via `getAssignment(id)`
- Manages local state for: query text, results, errors, loading

---

## State Management

### AuthContext

Global authentication provider using React Context.

```typescript
interface AuthContextType {
  user: AuthUser | null;     // Current authenticated user
  loading: boolean;          // True while validating token on mount
  login(email, password): Promise<void>;
  register(name, email, password): Promise<void>;
  logout(): void;
}
```

**Flow:**
1. On mount, checks `localStorage` for a token
2. If found, calls `GET /auth/me` to validate
3. If valid, sets `user` state; if invalid, clears token
4. `login()` / `register()` — Call API, store token in localStorage, set user
5. `logout()` — Remove token from localStorage, set user to null, redirect to `/login`

### Component-Level State

Each page manages its own state via `useState`/`useEffect`. No external state library.

---

## API Layer (`services/api.ts`)

Axios instance with base URL `/api/v1` and two interceptors:

### Request Interceptor
```
Before every request:
  → Read token from localStorage
  → If token exists, set Authorization: Bearer <token>
```

### Response Error Interceptor
```
On error response:
  → Extract message from err.response.data.error (real backend error)
  → Reject with new Error(extractedMessage)
```

This ensures `catch` blocks receive the actual SQL error or validation message instead of generic Axios error text.

### API Methods

| Method             | HTTP           | Endpoint             | Description                |
| ------------------ | -------------- | -------------------- | -------------------------- |
| `getAssignments()` | GET            | `/assignments`       | List all assignments       |
| `getAssignment(id)`| GET            | `/assignments/:id`   | Full assignment detail     |
| `executeQuery(q)`  | POST           | `/query/execute`     | Run SQL query in sandbox   |
| `getHint(data)`    | POST           | `/hints`             | Get AI hint                |
| `register(data)`   | POST           | `/auth/register`     | Create account             |
| `login(data)`      | POST           | `/auth/login`        | Sign in                    |
| `getMe()`          | GET            | `/auth/me`           | Validate token / get user  |

---

## Styling

### SCSS Architecture

```
src/styles/
├── _variables.scss    # Color palette, typography, spacing, breakpoints
├── _mixins.scss       # respond(), card(), btn-base(), flex-center(), truncate()
├── _reset.scss        # CSS reset + base styles
└── index.scss         # Import aggregator
```

### Design System

- **Theme**: Dark background (`#0a0a0f`) with card surfaces (`#12121a`)
- **Accent**: Cyan/teal (`#00d4ff`) for primary actions
- **Typography**: System font stack, fluid sizing
- **Breakpoints**: `sm: 576px`, `md: 768px`, `lg: 992px`, `xl: 1200px`
- **Components**: All use SCSS modules (`.module.scss` or co-located `.scss`)

### Key Mixins

- `respond($breakpoint)` — Media query helper
- `card()` — Applies dark surface with border and border-radius
- `btn-base()` — Reusable button styles
- `flex-center()` — Centering shorthand
- `truncate()` — Text overflow ellipsis

---

## TypeScript Types (`types/index.ts`)

```typescript
interface Assignment {
  id: number; title: string; description: string;
  difficulty: string; question: string; created_at: string;
}

interface ColumnDef { columnName: string; dataType: string; }

interface AssignmentTable {
  id: number; assignment_id: number; table_name: string;
  columns: ColumnDef[]; schema_sql: string;
}

interface AssignmentSampleData {
  id: number; assignment_id: number; table_name: string;
  rows: Record<string, unknown>[]; insert_sql: string;
}

interface AssignmentDetail extends Assignment {
  tables: AssignmentTable[];
  sample_data: AssignmentSampleData[];
}

interface QueryResult {
  rows: Record<string, unknown>[]; rowCount: number; fields: string[];
}

interface AuthUser {
  id: number; name: string; email: string; created_at: string;
}

interface AuthResponse { user: AuthUser; token: string; }
```

---

## Configuration

### Vite Config (`vite.config.ts`)

- **Path alias**: `@/` → `src/`
- **Dev proxy**: `/api` → `http://localhost:5000` (with `changeOrigin: true`)

### TypeScript Config (`tsconfig.app.json`)

- Target: `ES2022`, Module: `ESNext`, JSX: `react-jsx`
- Strict mode enabled
- `noUnusedLocals` + `noUnusedParameters` enabled
- Path alias: `@/*` → `src/*`

---

## Scripts

| Script    | Command              | Description                        |
| --------- | -------------------- | ---------------------------------- |
| `dev`     | `vite`               | Start Vite dev server on :5173     |
| `build`   | `tsc -b && vite build`| Type-check + production build     |
| `preview` | `vite preview`       | Preview production build locally   |
| `lint`    | `eslint .`           | Run ESLint                         |
