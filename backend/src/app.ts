import express from "express";
import cors from "cors";

import routes from "@/modules/index.routes";
import { errorMiddleware } from "@/middlewares/error.middleware";

const app = express();

// --------------- Global Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- home route ----------------------
app.get("/", (_req, res) =>
  res.json({ message: "Welcome to CipherSQL Studio API" })
);

// --------------- Health Check --------------------
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// --------------- Feature Routes ------------------
app.use("/api/v1", routes);

// --------------- Error Handler -------------------
app.use(errorMiddleware);

export default app;

// Ensure Vercel's Node runtime can resolve the Express handler in CJS mode.
module.exports = app;
