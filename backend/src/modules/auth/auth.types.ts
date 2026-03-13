export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

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
