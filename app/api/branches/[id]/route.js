// app/api/branches/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import Branch from "@/models/Branch";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const branch = await Branch.findById(params.id);
    if (!branch) return errorResponse("Branch not found.", 404);
    return successResponse({ branch });
  } catch (err) {
    console.error("get branch error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const updates = await req.json();
    await dbConnect();

    const branch = await Branch.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!branch) return errorResponse("Branch not found.", 404);

    return successResponse({ message: "Branch updated", branch });
  } catch (err) {
    console.error("update branch error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();
    const branch = await Branch.findByIdAndDelete(params.id);
    if (!branch) return errorResponse("Branch not found.", 404);

    return successResponse({ message: "Branch deleted" });
  } catch (err) {
    console.error("delete branch error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
