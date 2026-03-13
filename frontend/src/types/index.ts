export interface Assignment {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  expected_output_type: "table" | "single_value" | "column" | "count";
  expected_output: unknown;
  created_at: string;
  updated_at: string;
}

export interface ColumnDef {
  columnName: string;
  dataType: string;
}

export interface AssignmentTable {
  id: number;
  assignment_id: number;
  table_name: string;
  columns: ColumnDef[];
  schema_sql: string;
}

export interface AssignmentSampleData {
  id: number;
  assignment_id: number;
  table_name: string;
  rows: Record<string, unknown>[];
  insert_sql: string;
}

export interface AssignmentDetail extends Assignment {
  tables: AssignmentTable[];
  sample_data: AssignmentSampleData[];
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number;
  fields: string[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

export interface HintResponse {
  hint: string;
}

// Auth types
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
