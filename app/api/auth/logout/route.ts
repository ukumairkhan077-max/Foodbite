// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { successResponse } from "@/utils/response";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = successResponse({ message: "Logged out successfully" });
  (response as NextResponse).cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}