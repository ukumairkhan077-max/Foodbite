// app/api/favorites/[id]/route.js
// :id here is the menuItemId to remove from favorites.

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    await dbConnect();
    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found.", 404);

    user.favorites = user.favorites.filter((f) => f.toString() !== params.id);
    await user.save();

    return successResponse({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    console.error("remove favorite error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}