// app/api/categories/route.js
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

// GET /api/categories — public, lists all active categories (customer menu page)
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    return successResponse({ categories });
  } catch (err) {
    console.error("get categories error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// POST /api/categories — admin only, create a new category
export async function POST(req) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const { name, slug, imageUrl, displayOrder } = await req.json();
    if (!name || !slug) return errorResponse("Name and slug are required.");

    await dbConnect();

    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) return errorResponse("A category with this name or slug already exists.", 409);

    const category = await Category.create({ name, slug, imageUrl, displayOrder });
    return successResponse({ message: "Category created", category }, 201);
  } catch (err) {
    console.error("create category error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
