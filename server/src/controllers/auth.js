import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/index.js";
import { ApiError, asyncHandler, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/api.js";
import { env } from "../config/env.js";

function authPayload(user) {
  return { id: String(user._id), role: user.role, email: user.email, name: user.name };
}

function setAuthCookies(res, accessToken, refreshToken) {
  const options = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax", path: "/" };
  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);
}

export const register = asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().trim().min(1), email: z.string().email().transform((value) => value.toLowerCase()), password: z.string().min(8), role: z.enum(["Admin", "Manager", "Employee", "Viewer"]).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid registration details", parsed.error.flatten());
  if (await User.exists({ email: parsed.data.email })) throw new ApiError(409, "Email is already registered");
  const user = await User.create({ ...parsed.data, passwordHash: await bcrypt.hash(parsed.data.password, 12) });
  const accessToken = signAccessToken(user), refreshToken = signRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12); await user.save();
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({ user: authPayload(user), accessToken, refreshToken });
});

export const login = asyncHandler(async (req, res) => {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Email and password are required");
  const user = await User.findOne({ email: parsed.data.email.toLowerCase(), active: true }).select("+passwordHash +refreshTokenHash");
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) throw new ApiError(401, "Invalid email or password");
  user.lastLoginAt = new Date();
  const accessToken = signAccessToken(user), refreshToken = signRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12); await user.save();
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ user: authPayload(user), accessToken, refreshToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token required");
  let payload; try { payload = verifyRefreshToken(token); } catch { throw new ApiError(401, "Session expired"); }
  const user = await User.findById(payload.id).select("+refreshTokenHash");
  if (!user?.active || !user.refreshTokenHash || !(await bcrypt.compare(token, user.refreshTokenHash))) throw new ApiError(401, "Invalid refresh token");
  const accessToken = signAccessToken(user), refreshToken = signRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12); await user.save();
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ user: authPayload(user), accessToken, refreshToken });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user?.id) await User.findByIdAndUpdate(req.user.id, { $unset: { refreshTokenHash: 1 } });
  const options = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax", path: "/" };
  res.clearCookie("accessToken", options); res.clearCookie("refreshToken", options);
  res.status(204).end();
});
