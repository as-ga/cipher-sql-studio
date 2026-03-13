import { Router } from "express";
import authRoutes from "@/modules/auth/auth.routes";
import assignmentsRoutes from "@/modules/assignments/assignments.routes";
import queryRoutes from "@/modules/query/query.routes";
import hintsRoutes from "@/modules/hints/hints.routes";
import { requireAuth } from "@/middlewares/auth.middleware";

const router = Router();

// Public routes
router.use("/auth", authRoutes);

// Protected routes
router.use("/assignments", requireAuth, assignmentsRoutes);
router.use("/query", requireAuth, queryRoutes);
router.use("/hints", requireAuth, hintsRoutes);

export default router;
