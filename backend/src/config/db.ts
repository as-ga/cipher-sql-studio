import { Pool } from "pg";

// const pool = new Pool({
//   host: process.env.DB_HOST || "localhost",
//   port: parseInt(process.env.DB_PORT || "5432", 10),
//   user: process.env.DB_USER || "postgres",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "cipher_sql_studio",
// });
const pool = new Pool({ connectionString: process.env.DB_URI });

export default pool;
