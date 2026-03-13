import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError, ApiResponse } from "@/utils/apiHandler";
import * as assignmentsService from "./assignments.service";

const getAll = asyncHandler(async (_, res) => {
  console.log("Fetching all assignments...");
  const assignments = await assignmentsService.getAllAssignments();
  console.log(`Retrieved ${assignments.length} assignments.`);

  res.json(
    new ApiResponse(200, "Assignments retrieved successfully", assignments)
  );
});

const getById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id[0], 10);

  if (isNaN(id)) throw new ApiError(400, "Invalid assignment ID");

  const assignment = await assignmentsService.getAssignmentById(id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  res.json(
    new ApiResponse(
      200,
      "Assignment details retrieved successfully",
      assignment
    )
  );
});

export { getAll, getById };
