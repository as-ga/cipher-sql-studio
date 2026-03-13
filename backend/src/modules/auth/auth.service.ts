import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/config/db";
import env from "@/config/env";
import { ApiError } from "@/utils/apiHandler";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AuthUser,
} from "./auth.types";

const SALT_ROUNDS = 10;

function signToken(userId: number): string {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as string,
  } as jwt.SignOptions);
}

function toAuthUser(row: any): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    created_at: row.created_at,
  };
}

export async function register(
  payload: RegisterRequest
): Promise<AuthResponse> {
  const { name, email, password } = payload;

  // Check if email already exists
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    throw new ApiError(409, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
    [name, email, hashedPassword]
  );

  const user = toAuthUser(rows[0]);
  const token = signToken(user.id);

  return { user, token };
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { email, password } = payload;

  const { rows } = await pool.query(
    "SELECT id, name, email, password, created_at FROM users WHERE email = $1",
    [email]
  );

  if (rows.length === 0) {
    throw new ApiError(401, "Invalid email or password");
  }

  const row = rows[0];
  const valid = await bcrypt.compare(password, row.password);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const user = toAuthUser(row);
  const token = signToken(user.id);

  return { user, token };
}

export async function getMe(userId: number): Promise<AuthUser> {
  const { rows } = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [userId]
  );

  if (rows.length === 0) {
    throw new ApiError(404, "User not found");
  }

  return toAuthUser(rows[0]);
}
