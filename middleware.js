// middleware.js
// Protects all /api/admin/* routes — only ADMIN or BRANCH_MANAGER roles may pass.
// Runs before the route handler, using the JWT from the auth_token cookie or Authorization header.

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

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
