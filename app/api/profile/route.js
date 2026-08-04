// app/api/profile/route.js
// Lets a logged-in user update their own name/email — NOT phone or role
// (phone is the OTP-verified identity, role can only be changed by an admin).

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { isValidEmail } from "@/utils/validators";
import { getAuthUser } from "@/lib/auth";

export async function PUT(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const { name, email } = await req.json();

    if (email && !isValidEmail(email)) return errorResponse("Please provide a valid email address.");

    await dbConnect();

    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: authUser.userId } });
      if (existing) return errorResponse("This email is already in use.", 409);
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();

    const user = await User.findByIdAndUpdate(authUser.userId, updates, { new: true, runValidators: true });
    if (!user) return errorResponse("User not found.", 404);

    return successResponse({
      message: "Profile updated",
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("update profile error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}