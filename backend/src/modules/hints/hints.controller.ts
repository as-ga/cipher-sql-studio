import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as hintsService from "./hints.service";
import { ApiError, ApiResponse } from "@/utils/apiHandler";
const getHint = asyncHandler(async (req: Request, res: Response) => {
  const { question, query, schema } = req.body;

  // console.log("[HINT REQUEST]", { question, query, schema });

  if (!question || !schema) {
    throw new ApiError(
      400,
      "Missing required fields: question, query, and schema are all required."
    );
  }

  const result = await hintsService.getHint({ question, query, schema });

  res.json(new ApiResponse(200, "Hint generated successfully", result));
});

export { getHint };
