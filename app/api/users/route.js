// app/api/users/route.js
// Admin-only: list/search customer accounts (Customer Management module).

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

export async function GET(req) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "CUSTOMER";
    const search = searchParams.get("search");

    const filter = { role };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    return successResponse({ users });
  } catch (err) {
    console.error("get users error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}