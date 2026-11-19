import { ApiError } from "../utils/api.js";
import { env } from "../config/env.js";

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const body = { message: error.message || "Unexpected server error" };
  if (error.details) body.details = error.details;
  if (env.NODE_ENV !== "production" && error.stack) body.stack = error.stack;
  res.status(error.statusCode || 500).json(body);
}
