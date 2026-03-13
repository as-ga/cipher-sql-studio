import pool from "@/config/db";
import type {
  Assignment,
  AssignmentDetail,
  AssignmentTable,
  AssignmentSampleData,
} from "./assignments.types";

export async function getAllAssignments(): Promise<Assignment[]> {
  const { rows } = await pool.query<Assignment>(
    "SELECT id, title, description, difficulty, question, created_at FROM assignments ORDER BY id"
  );
  return rows;
}

export async function getAssignmentById(
  id: number
): Promise<AssignmentDetail | null> {
  const { rows: assignments } = await pool.query<Assignment>(
    "SELECT id, title, description, difficulty, question, created_at FROM assignments WHERE id = $1",
    [id]
  );

  if (assignments.length === 0) return null;

  const assignment = assignments[0];

  const [tablesResult, sampleDataResult] = await Promise.all([
    pool.query<AssignmentTable>(
      "SELECT id, assignment_id, table_name, columns, schema_sql FROM assignment_tables WHERE assignment_id = $1 ORDER BY id",
      [id]
    ),
    pool.query<AssignmentSampleData>(
      "SELECT id, assignment_id, table_name, rows, insert_sql FROM assignment_sample_data WHERE assignment_id = $1 ORDER BY id",
      [id]
    ),
  ]);

  return {
    ...assignment,
    tables: tablesResult.rows,
    sample_data: sampleDataResult.rows,
  };
}
