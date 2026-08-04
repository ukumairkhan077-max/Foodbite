// app/api/addresses/[id]/route.js
// :id here refers to the address subdocument's _id inside user.addresses, not a User id.

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const updates = await req.json();
    await dbConnect();

    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found.", 404);

    const address = user.addresses.id(params.id);
    if (!address) return errorResponse("Address not found.", 404);

    if (updates.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, updates);
    await user.save();

    return successResponse({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    console.error("update address error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    await dbConnect();
    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found.", 404);

    const address = user.addresses.id(params.id);
    if (!address) return errorResponse("Address not found.", 404);

    address.deleteOne();
    await user.save();

    return successResponse({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    console.error("delete address error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}