import { Router } from "express";
import * as hintsController from "./hints.controller";

const router = Router();

router.post("/", hintsController.getHint);

export default router;
