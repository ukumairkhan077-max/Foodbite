// middleware.js
// Protects all /api/admin/* routes — only ADMIN or BRANCH_MANAGER roles may pass.
// Runs before the route handler, using the JWT from the auth_token cookie or Authorization header.
//
// IMPORTANT: this must run on the Node.js runtime, not the default Edge runtime.
// getAuthUser() -> verifyAuthToken() uses the `jsonwebtoken` package, which relies on
// Node's `crypto` module. That module isn't available in the Edge runtime, so without
// `export const runtime = "nodejs"` below, every request to /api/admin/* would throw
// at the middleware layer in production (this is one of the "random" auth/DB-adjacent
// errors you were seeing).

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "BRANCH_MANAGER") {
      return NextResponse.json({ success: false, message: "Admin access only." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
