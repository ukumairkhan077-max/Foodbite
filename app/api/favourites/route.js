// app/api/favorites/route.js
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

// GET /api/favorites — the logged-in customer's favorited menu items
export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    await dbConnect();
    const user = await User.findById(authUser.userId).populate("favorites");
    if (!user) return errorResponse("User not found.", 404);

    return successResponse({ favorites: user.favorites });
  } catch (err) {
    console.error("get favorites error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// POST /api/favorites — add a menu item to favorites
export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const { menuItemId } = await req.json();
    if (!menuItemId) return errorResponse("menuItemId is required.");

    await dbConnect();
    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found.", 404);

    if (!user.favorites.includes(menuItemId)) {
      user.favorites.push(menuItemId);
      await user.save();
    }

    return successResponse({ message: "Added to favorites", favorites: user.favorites }, 201);
  } catch (err) {
    console.error("add favorite error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}