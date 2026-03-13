const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

async function main() {
  const connectionString = process.env.DB_URI;

  if (!connectionString) {
    console.error("DB_URI is not set in .env");
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL.");

    const sql = fs.readFileSync(path.join(__dirname, "init.sql"), "utf-8");

    await client.query(sql);
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
