// app/api/menu/route.js
import dbConnect from "@/lib/dbConnect";
import MenuItem from "@/models/MenuItem";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

// GET /api/menu — public. Supports ?category=<id>&branch=<id>&search=<text>
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const branch = searchParams.get("branch");
    const search = searchParams.get("search");

    const filter = { isAvailable: true };
    if (category) filter.category = category;
    if (branch) filter.branch = branch;
    if (search) filter.$text = { $search: search };

    const items = await MenuItem.find(filter).populate("category", "name slug");
    return successResponse({ items });
  } catch (err) {
    console.error("get menu error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// POST /api/menu — admin only, create a new menu item
export async function POST(req) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const body = await req.json();
    const { name, price, category } = body;

    if (!name || price == null || !category) {
      return errorResponse("Name, price, and category are required.");
    }

    await dbConnect();
    const item = await MenuItem.create(body);
    return successResponse({ message: "Menu item created", item }, 201);
  } catch (err) {
    console.error("create menu item error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}