// lib/auth.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Read env vars lazily (inside functions), not at module load time. This matters
// for scripts run via plain `node` (like seed-admin.js), where dotenv.config()
// must finish BEFORE these are read. Since ES module imports are hoisted above
// all other code — even above a dotenv.config() call that textually appears
// earlier in the importing file — checking process.env at the top of this file
// would run too early and throw "Please define JWT_SECRET" even when it's set.
function getJwtSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable in .env.local");
  }
  return JWT_SECRET;
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const TEMP_TOKEN_EXPIRES_IN = "15m"; // used only for the OTP -> complete-registration handoff

// ── Passwords ──────────────────────────────────────────

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ── Full session token (used after login / completed registration) ──
// payload shape: { userId, role }

export function signAuthToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret());
}

// ── Temporary token (used only between OTP verification and profile completion) ──
// payload shape: { userId, purpose: "complete-registration" }

export function signTempToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TEMP_TOKEN_EXPIRES_IN });
}

export function verifyTempToken(token) {
  const decoded = jwt.verify(token, getJwtSecret());
  if (decoded.purpose !== "complete-registration") {
    throw new Error("Invalid token purpose");
  }
  return decoded;
}

// ── Request helpers ──────────────────────────────────────

// Reads the bearer token from the Authorization header, or falls back to the auth_token cookie
export function getTokenFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookieToken = req.cookies.get("auth_token")?.value;
  return cookieToken || null;
}

export function getAuthUser(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

// Use inside a route handler to enforce role access.
// Example: const auth = requireRole(req, ["ADMIN"]); if (!auth) return unauthorized response.
export function requireRole(req, allowedRoles) {
  const user = getAuthUser(req);
  if (!user) return null;
  if (!allowedRoles.includes(user.role)) return null;
  return user;
}

export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds
