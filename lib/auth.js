// lib/auth.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const TEMP_TOKEN_EXPIRES_IN = "15m"; // used only for the OTP -> complete-registration handoff

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable in .env.local");
}

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// ── Temporary token (used only between OTP verification and profile completion) ──
// payload shape: { userId, purpose: "complete-registration" }

export function signTempToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TEMP_TOKEN_EXPIRES_IN });
}

export function verifyTempToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.purpose !== "complete-registration") {
    throw new Error("Invalid token purpose");
  }
  return decoded;
}

// ── Request helpers ──────────────────────────────────────

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

export function requireRole(req, allowedRoles) {
  const user = getAuthUser(req);
  if (!user) return null;
  if (!allowedRoles.includes(user.role)) return null;
  return user;
}

export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days