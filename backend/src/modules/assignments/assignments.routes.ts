import { Router } from "express";
import * as assignmentsController from "./assignments.controller";

const router = Router();

router.get("/", assignmentsController.getAll);
router.get("/:id", assignmentsController.getById);

export default router;
