// app/api/menu/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import MenuItem from "@/models/MenuItem";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const item = await MenuItem.findById(params.id).populate("category", "name slug");
    if (!item) return errorResponse("Menu item not found.", 404);
    return successResponse({ item });
  } catch (err) {
    console.error("get menu item error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const updates = await req.json();
    await dbConnect();

    const item = await MenuItem.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!item) return errorResponse("Menu item not found.", 404);

    return successResponse({ message: "Menu item updated", item });
  } catch (err) {
    console.error("update menu item error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();
    const item = await MenuItem.findByIdAndDelete(params.id);
    if (!item) return errorResponse("Menu item not found.", 404);

    return successResponse({ message: "Menu item deleted" });
  } catch (err) {
    console.error("delete menu item error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
