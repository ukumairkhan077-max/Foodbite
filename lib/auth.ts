// lib/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const TEMP_TOKEN_EXPIRES_IN = "15m";

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable in .env.local");
}

export type UserRole = "CUSTOMER" | "ADMIN" | "BRANCH_MANAGER" | "RIDER";

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
}

export interface TempTokenPayload {
  userId: string;
  purpose: "complete-registration";
}

// ── Passwords ──────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Full session token (used after login / completed registration) ──

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

// ── Temporary token (used only between OTP verification and profile completion) ──

export function signTempToken(payload: TempTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TEMP_TOKEN_EXPIRES_IN });
}

export function verifyTempToken(token: string): TempTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as TempTokenPayload;
  if (decoded.purpose !== "complete-registration") {
    throw new Error("Invalid token purpose");
  }
  return decoded;
}

// ── Request helpers ──────────────────────────────────────

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookieToken = req.cookies.get("auth_token")?.value;
  return cookieToken || null;
}

export function getAuthUser(req: NextRequest): AuthTokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

export function requireRole(req: NextRequest, allowedRoles: UserRole[]): AuthTokenPayload | null {
  const user = getAuthUser(req);
  if (!user) return null;
  if (!allowedRoles.includes(user.role)) return null;
  return user;
}

export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days