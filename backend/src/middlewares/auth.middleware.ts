import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "@/config/env";
import { ApiError } from "@/utils/apiHandler";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: number };
    (req as any).userId = decoded.userId;
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}
