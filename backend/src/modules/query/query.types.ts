export interface QueryExecuteRequest {
  query: string;
}

export interface QueryExecuteResponse {
  rows: Record<string, unknown>[];
  rowCount: number;
  fields: string[];
}
