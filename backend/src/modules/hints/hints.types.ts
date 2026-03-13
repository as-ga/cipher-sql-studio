export interface HintRequest {
  question: string;
  query: string;
  schema: string;
}

export interface HintResponse {
  hint: string;
}
