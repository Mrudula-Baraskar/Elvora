import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env.js";
import { apiRoutes } from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";

const allowedOrigins = [
  ...env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
  "http://127.0.0.1:5173",
  "http://localhost:5173"
];

function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error(`CORS blocked origin: ${origin}`));
}

export function createApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use("/pdfs", express.static(path.resolve(process.cwd(), "storage", "pdfs")));
  app.get("/health", (_req, res) => res.json({ ok: true, service: "opspilot-server" }));
  app.use("/api", apiRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
