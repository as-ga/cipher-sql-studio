import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as queryService from "./query.service";
import type { QueryExecuteRequest } from "./query.types";
import { ApiError, ApiResponse } from "@/utils/apiHandler";

const execute = asyncHandler(async (req: Request, res: Response) => {
  const { query, assignment_id } = req.body as QueryExecuteRequest & {
    assignment_id?: number;
  };

  if (!query || typeof query !== "string") {
    throw new ApiError(
      400,
      "Invalid query: 'query' field is required and must be a string."
    );
  }

  // console.log("[QUERY EXECUTE]", { query, assignment_id });
  const result = await queryService.executeQuery(query, assignment_id);

  res.json(new ApiResponse(200, "Query executed successfully", result));
});

export { execute };
