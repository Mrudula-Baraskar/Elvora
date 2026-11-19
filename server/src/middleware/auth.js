import { ApiError, asyncHandler, verifyAccessToken } from "../utils/api.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.accessToken ?? req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new ApiError(401, "Authentication required");
  try { req.user = verifyAccessToken(token); }
  catch { throw new ApiError(401, "Session expired"); }
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, "Authentication required"));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, "Insufficient permissions"));
  next();
};
