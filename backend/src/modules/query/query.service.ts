import pool from "@/config/db";
import { sanitizeQuery } from "@/utils/sanitizeQuery";
import type { QueryExecuteResponse } from "./query.types";

export async function executeQuery(
  rawQuery: string,
  assignmentId?: number
): Promise<QueryExecuteResponse> {
  const sanitizeResult = sanitizeQuery(rawQuery);
  if (!sanitizeResult.safe) {
    throw Object.assign(new Error(sanitizeResult.reason), { statusCode: 400 });
  }

  // Create an isolated sandbox schema for this execution
  const schemaName = `sandbox_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const client = await pool.connect();

  try {
    await client.query(`CREATE SCHEMA ${schemaName}`);
    await client.query(`SET search_path TO ${schemaName}, public`);

    // If assignment_id is provided, set up the assignment's tables and sample data
    if (assignmentId) {
      // Use pool (public schema) for metadata lookups
      const { rows: tables } = await pool.query(
        "SELECT schema_sql FROM assignment_tables WHERE assignment_id = $1 ORDER BY id",
        [assignmentId]
      );
      for (const t of tables) {
        await client.query(t.schema_sql);
      }

      const { rows: sampleData } = await pool.query(
        "SELECT insert_sql FROM assignment_sample_data WHERE assignment_id = $1 ORDER BY id",
        [assignmentId]
      );
      for (const s of sampleData) {
        await client.query(s.insert_sql);
      }
    }

    // Execute the user's query inside the sandbox
    let result;
    try {
      result = await client.query(rawQuery);
    } catch (err: any) {
      throw Object.assign(new Error(err.message || "Query execution failed"), {
        statusCode: 400,
      });
    }

    // Log the attempt (fire-and-forget)
    pool
      .query(
        "INSERT INTO query_attempts (assignment_id, query) VALUES ($1, $2)",
        [assignmentId ?? null, rawQuery]
      )
      .catch(() => {});

    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0,
      fields: result.fields.map((f) => f.name),
    };
  } finally {
    // Always clean up the sandbox schema
    await client
      .query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`)
      .catch(() => {});
    client.release();
  }
}
