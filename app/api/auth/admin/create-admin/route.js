// app/api/auth/admin/create-admin/route.js
// The ONLY way an admin account can be created. No public signup route exists for role=ADMIN.
// Caller must already be authenticated as an ADMIN — enforced by requireRole() below.

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { isValidEmail, isValidPassword } from "@/utils/validators";
import { requireRole, hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) {
      return errorResponse("Only an existing admin can create a new admin account.", 403);
    }

    const { name, email, password, phone } = await req.json();

    if (!name || name.trim().length < 2) return errorResponse("Please provide a valid name.");
    if (!email || !isValidEmail(email)) return errorResponse("Please provide a valid email address.");
    if (!phone) return errorResponse("Phone number is required.");
    if (!password || !isValidPassword(password)) {
      return errorResponse("Password must be at least 8 characters and include a letter and a number.");
    }

    await dbConnect();

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase().trim() }, { phone }] });
    if (existing) return errorResponse("An account with this email or phone already exists.", 409);

    const newAdmin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      password: await hashPassword(password),
      role: "ADMIN",
      isVerified: true,
      isProfileComplete: true,
      createdBy: requester.userId,
    });

    return successResponse(
      {
        message: "Admin account created successfully",
        admin: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          phone: newAdmin.phone,
          role: newAdmin.role,
        },
      },
      201
    );
  } catch (err) {
    console.error("create-admin error:", err);
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
