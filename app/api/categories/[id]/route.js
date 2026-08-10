// app/api/categories/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

// GET /api/categories/:id — public
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const category = await Category.findById(params.id);
    if (!category) return errorResponse("Category not found.", 404);
    return successResponse({ category });
  } catch (err) {
    console.error("get category error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// PUT /api/categories/:id — admin only
export async function PUT(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const updates = await req.json();
    await dbConnect();

    const category = await Category.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!category) return errorResponse("Category not found.", 404);

    return successResponse({ message: "Category updated", category });
  } catch (err) {
    console.error("update category error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// DELETE /api/categories/:id — admin only
export async function DELETE(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();
    const category = await Category.findByIdAndDelete(params.id);
    if (!category) return errorResponse("Category not found.", 404);

    return successResponse({ message: "Category deleted" });
  } catch (err) {
    console.error("delete category error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
