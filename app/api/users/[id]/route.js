// app/api/users/[id]/route.js
// Admin-only: view a customer's details, or block/unblock (isActive) their account.

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();
    const user = await User.findById(params.id);
    if (!user) return errorResponse("User not found.", 404);

    return successResponse({ user });
  } catch (err) {
    console.error("get user error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// PATCH — admin toggles a customer's isActive status (block/unblock)
export async function PATCH(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const { isActive } = await req.json();
    if (isActive === undefined) return errorResponse("isActive is required.");

    await dbConnect();
    const user = await User.findByIdAndUpdate(params.id, { isActive }, { new: true });
    if (!user) return errorResponse("User not found.", 404);

    return successResponse({ message: `User ${isActive ? "activated" : "deactivated"}`, user });
  } catch (err) {
    console.error("update user error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
