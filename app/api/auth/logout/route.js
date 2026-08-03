// app/api/auth/logout/route.js
import { successResponse } from "@/utils/response";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = successResponse({ message: "Logged out successfully" });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
