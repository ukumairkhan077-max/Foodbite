// app/api/riders/route.js
// Riders are Users with role: "RIDER" — there's no separate Rider collection.

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

// GET /api/riders — admin only, list riders (e.g. to assign one to an order)
export async function GET(req) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const availableOnly = searchParams.get("available") === "true";

    const filter = { role: "RIDER" };
    if (availableOnly) filter["riderDetails.isAvailable"] = true;

    const riders = await User.find(filter).select("name phone riderDetails");
    return successResponse({ riders });
  } catch (err) {
    console.error("get riders error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}