import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/index.js";
import { ApiError, asyncHandler } from "../utils/api.js";

export const listUsers = asyncHandler(async (_req, res) => {
  res.json(await User.find().sort({ createdAt: -1 }));
});

export const createUser = asyncHandler(async (req, res) => {
  const parsed = z.object({ name: z.string().trim().min(1), email: z.string().email(), password: z.string().min(8), role: z.enum(["Admin", "Manager", "Employee", "Viewer"]).optional() }).safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid user details", parsed.error.flatten());
  if (await User.exists({ email: parsed.data.email.toLowerCase() })) throw new ApiError(409, "Email is already registered");
  const user = await User.create({ ...parsed.data, email: parsed.data.email.toLowerCase(), passwordHash: await bcrypt.hash(parsed.data.password, 12) });
  res.status(201).json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const parsed = z.object({ name: z.string().trim().min(1).optional(), email: z.string().email().optional(), password: z.string().min(8).optional(), role: z.enum(["Admin", "Manager", "Employee", "Viewer"]).optional(), active: z.boolean().optional() }).strict().safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid user details", parsed.error.flatten());
  const changes = { ...parsed.data };
  if (changes.email) changes.email = changes.email.toLowerCase();
  if (changes.password) { changes.passwordHash = await bcrypt.hash(changes.password, 12); delete changes.password; }
  const user = await User.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, "User not found");
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(204).end();
});
