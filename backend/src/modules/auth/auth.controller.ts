import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError, ApiResponse } from "@/utils/apiHandler";
import * as authService from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const result = await authService.register({ name, email, password });
  res.status(201).json(new ApiResponse(201, "Registered successfully", result));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const result = await authService.login({ email, password });
  res.json(new ApiResponse(200, "Login successful", result));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = await authService.getMe(userId);
  res.json(new ApiResponse(200, "User fetched", user));
});
