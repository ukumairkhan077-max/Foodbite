// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export function middleware(req: NextRequest) {
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