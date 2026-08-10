// app/api/auth/me/route.js
// Returns the currently logged-in user's profile — the frontend calls this on
// app load to check "am I logged in, and as what role" (customer vs admin).

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Not authenticated.", 401);

    await dbConnect();
    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found.", 404);

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("get me error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
