import axios from "axios";
import type {
  Assignment,
  AssignmentDetail,
  QueryResult,
  HintResponse,
  AuthResponse,
  AuthUser,
} from "@/types";

const serverUrl = import.meta.env.VITE_SERVER_URL + "/api/v1";
console.log("API Base URL:", serverUrl);
const http = axios.create({
  baseURL: serverUrl,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error || err.message || "Something went wrong";
    return Promise.reject(new Error(msg));
  }
);

export const api = {
  getAssignments: () =>
    http.get<{ data: Assignment[] }>("/assignments").then((r) => r.data.data),

  getAssignment: (id: number) =>
    http
      .get<{ data: AssignmentDetail }>(`/assignments/${id}`)
      .then((r) => r.data.data),

  executeQuery: (query: string, assignmentId?: number) =>
    http
      .post<{ data: QueryResult }>("/query/execute", {
        query,
        assignment_id: assignmentId,
      })
      .then((r) => r.data.data),

  getHint: (question: string, query: string, schema: string) =>
    http
      .post<{ data: HintResponse }>("/hints", { question, query, schema })
      .then((r) => r.data.data),

  // Auth
  register: (name: string, email: string, password: string) =>
    http
      .post<{ data: AuthResponse }>("/auth/register", { name, email, password })
      .then((r) => r.data.data),

  login: (email: string, password: string) =>
    http
      .post<{ data: AuthResponse }>("/auth/login", { email, password })
      .then((r) => r.data.data),

  getMe: () =>
    http.get<{ data: AuthUser }>("/auth/me").then((r) => r.data.data),
};
