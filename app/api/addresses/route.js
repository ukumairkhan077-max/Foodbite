// app/api/addresses/route.js
// Addresses are embedded inside the User document (see models/User.js),
// so these routes just push/read into that array rather than a separate collection.

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

// GET /api/addresses — list the logged-in customer's saved addresses
export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    await dbConnect();
    const user = await User.findById(authUser.userId).select("addresses");
    if (!user) return errorResponse("User not found.", 404);

    return successResponse({ addresses: user.addresses });
  } catch (err) {
    console.error("get addresses error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// POST /api/addresses — add a new address
export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const { label, fullAddress, city, latitude, longitude, isDefault } = await req.json();
    if (!fullAddress || !city) return errorResponse("fullAddress and city are required.");

    await dbConnect();
    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found.", 404);

    // If this new address is marked default, unset default on all existing ones
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({ label, fullAddress, city, latitude, longitude, isDefault: !!isDefault });
    await user.save();

    return successResponse({ message: "Address added", addresses: user.addresses }, 201);
  } catch (err) {
    console.error("add address error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
