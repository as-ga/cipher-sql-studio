import { Router } from "express";
import * as queryController from "./query.controller";

const router = Router();

router.post("/execute", queryController.execute);

export default router;
