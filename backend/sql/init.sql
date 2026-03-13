-- CipherSQLStudio — Database Initialization

-- Drop existing tables to recreate with latest schema
DROP TABLE IF EXISTS query_attempts CASCADE;
DROP TABLE IF EXISTS assignment_sample_data CASCADE;
DROP TABLE IF EXISTS assignment_tables CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- 0. Users (authentication)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- 1. Assignments (metadata + expected output)
-- =============================================
CREATE TABLE IF NOT EXISTS assignments (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    difficulty      VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question        TEXT NOT NULL,
    expected_output_type  VARCHAR(50) NOT NULL DEFAULT 'table'
                          CHECK (expected_output_type IN ('table', 'single_value', 'column', 'count')),
    expected_output JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. Sample tables per assignment (schema + column metadata)
-- =============================================
CREATE TABLE IF NOT EXISTS assignment_tables (
    id              SERIAL PRIMARY KEY,
    assignment_id   INT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    table_name      VARCHAR(255) NOT NULL,
    columns         JSONB NOT NULL DEFAULT '[]'::jsonb,
    schema_sql      TEXT NOT NULL
);

-- =============================================
-- 3. Sample data rows per assignment
-- =============================================
CREATE TABLE IF NOT EXISTS assignment_sample_data (
    id              SERIAL PRIMARY KEY,
    assignment_id   INT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    table_name      VARCHAR(255) NOT NULL,
    rows            JSONB NOT NULL DEFAULT '[]'::jsonb,
    insert_sql      TEXT NOT NULL
);

-- =============================================
-- 4. Query attempts (user progress tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS query_attempts (
    id              SERIAL PRIMARY KEY,
    assignment_id   INT REFERENCES assignments(id) ON DELETE SET NULL,
    query           TEXT NOT NULL,
    is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_count   INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignment_tables_assignment_id ON assignment_tables(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_sample_data_assignment_id ON assignment_sample_data(assignment_id);
CREATE INDEX IF NOT EXISTS idx_query_attempts_assignment_id ON query_attempts(assignment_id);

-- =============================================
-- Seed data
-- =============================================

INSERT INTO assignments (title, description, difficulty, question, expected_output_type, expected_output) VALUES
(
  'Select All Users',
  'Practice selecting all rows from a users table.',
  'easy',
  'Write a query to select all columns from the "users" table.',
  'table',
  '[{"id":1,"name":"Alice","email":"alice@example.com","age":30},{"id":2,"name":"Bob","email":"bob@example.com","age":22},{"id":3,"name":"Charlie","email":"charlie@example.com","age":28}]'
),
(
  'Filter by Age',
  'Practice filtering rows using a WHERE clause.',
  'easy',
  'Write a query to select all users older than 25.',
  'table',
  '[{"id":1,"name":"Alice","email":"alice@example.com","age":30},{"id":3,"name":"Charlie","email":"charlie@example.com","age":28}]'
),
(
  'Join Orders',
  'Practice joining two tables together.',
  'medium',
  'Write a query to list all orders along with the customer name.',
  'table',
  '[{"name":"Alice","product":"Laptop","total_amount":999.99,"order_date":"2025-01-15"},{"name":"Bob","product":"Phone","total_amount":499.99,"order_date":"2025-02-20"},{"name":"Alice","product":"Tablet","total_amount":349.99,"order_date":"2025-03-10"}]'
);

INSERT INTO assignment_tables (assignment_id, table_name, columns, schema_sql) VALUES
(1, 'users',
 '[{"columnName":"id","dataType":"INTEGER"},{"columnName":"name","dataType":"TEXT"},{"columnName":"email","dataType":"TEXT"},{"columnName":"age","dataType":"INTEGER"}]',
 'CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(255), age INT);'),
(2, 'users',
 '[{"columnName":"id","dataType":"INTEGER"},{"columnName":"name","dataType":"TEXT"},{"columnName":"email","dataType":"TEXT"},{"columnName":"age","dataType":"INTEGER"}]',
 'CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(255), age INT);'),
(3, 'customers',
 '[{"columnName":"id","dataType":"INTEGER"},{"columnName":"name","dataType":"TEXT"},{"columnName":"email","dataType":"TEXT"}]',
 'CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(255));'),
(3, 'orders',
 '[{"columnName":"id","dataType":"INTEGER"},{"columnName":"customer_id","dataType":"INTEGER"},{"columnName":"product","dataType":"TEXT"},{"columnName":"total_amount","dataType":"REAL"},{"columnName":"order_date","dataType":"DATE"}]',
 'CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, customer_id INT REFERENCES customers(id), product VARCHAR(255), total_amount DECIMAL(10,2), order_date DATE DEFAULT CURRENT_DATE);');

INSERT INTO assignment_sample_data (assignment_id, table_name, rows, insert_sql) VALUES
(1, 'users',
 '[{"id":1,"name":"Alice","email":"alice@example.com","age":30},{"id":2,"name":"Bob","email":"bob@example.com","age":22},{"id":3,"name":"Charlie","email":"charlie@example.com","age":28}]',
 'INSERT INTO users (name, email, age) VALUES (''Alice'', ''alice@example.com'', 30), (''Bob'', ''bob@example.com'', 22), (''Charlie'', ''charlie@example.com'', 28);'),
(2, 'users',
 '[{"id":1,"name":"Alice","email":"alice@example.com","age":30},{"id":2,"name":"Bob","email":"bob@example.com","age":22},{"id":3,"name":"Charlie","email":"charlie@example.com","age":28}]',
 'INSERT INTO users (name, email, age) VALUES (''Alice'', ''alice@example.com'', 30), (''Bob'', ''bob@example.com'', 22), (''Charlie'', ''charlie@example.com'', 28);'),
(3, 'customers',
 '[{"id":1,"name":"Alice","email":"alice@example.com"},{"id":2,"name":"Bob","email":"bob@example.com"}]',
 'INSERT INTO customers (name, email) VALUES (''Alice'', ''alice@example.com''), (''Bob'', ''bob@example.com'');'),
(3, 'orders',
 '[{"id":1,"customer_id":1,"product":"Laptop","total_amount":999.99,"order_date":"2025-01-15"},{"id":2,"customer_id":2,"product":"Phone","total_amount":499.99,"order_date":"2025-02-20"},{"id":3,"customer_id":1,"product":"Tablet","total_amount":349.99,"order_date":"2025-03-10"}]',
 'INSERT INTO orders (customer_id, product, total_amount, order_date) VALUES (1, ''Laptop'', 999.99, ''2025-01-15''), (2, ''Phone'', 499.99, ''2025-02-20''), (1, ''Tablet'', 349.99, ''2025-03-10'');');
