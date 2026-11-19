import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const roles = ["Admin", "Manager", "Employee", "Viewer"];

export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function signAccessToken(user) {
  return jwt.sign({ id: user.id ?? user._id, role: user.role, email: user.email, name: user.name }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN });
}

export function signRefreshToken(user) {
  return jwt.sign({ id: user.id ?? user._id }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export function crudController(model) {
  return {
    list: asyncHandler(async (req, res) => {
      const limit = Math.min(500, Math.max(1, Number.parseInt(req.query.limit, 10) || 100));
      let query = model.find();
      if (req.query.q?.trim()) query = model.find({ $text: { $search: req.query.q.trim() } });
      res.json(await query.sort({ createdAt: -1 }).limit(limit));
    }),
    get: asyncHandler(async (req, res) => {
      const doc = await model.findById(req.params.id);
      if (!doc) throw new ApiError(404, "Resource not found");
      res.json(doc);
    }),
    create: asyncHandler(async (req, res) => {
      res.status(201).json(await model.create(req.body));
    }),
    update: asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) throw new ApiError(404, "Resource not found");
      res.json(doc);
    }),
    remove: asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndDelete(req.params.id);
      if (!doc) throw new ApiError(404, "Resource not found");
      res.status(204).end();
    })
  };
}
