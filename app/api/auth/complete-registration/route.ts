// app/api/auth/complete-registration/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { isValidEmail, isValidPassword } from "@/utils/validators";
import { verifyTempToken, hashPassword, signAuthToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { tempToken, name, email, password } = await req.json();

    if (!tempToken) return errorResponse("Missing verification token.", 401);
    if (!name || name.trim().length < 2) return errorResponse("Please provide a valid name.");
    if (!email || !isValidEmail(email)) return errorResponse("Please provide a valid email address.");
    if (!password || !isValidPassword(password)) {
      return errorResponse("Password must be at least 8 characters and include a letter and a number.");
    }

    let payload;
    try {
      payload = verifyTempToken(tempToken);
    } catch {
      return errorResponse("Verification token is invalid or expired. Please verify OTP again.", 401);
    }

    await dbConnect();

    const user = await User.findById(payload.userId);
    if (!user) return errorResponse("Account not found.", 404);
    if (!user.isVerified) return errorResponse("Phone number not verified.", 401);
    if (user.isProfileComplete) return errorResponse("Registration already completed. Please login.", 409);

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) return errorResponse("This email is already in use.", 409);

    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    user.password = await hashPassword(password);
    user.isProfileComplete = true;
    await user.save();

    const authToken = signAuthToken({ userId: user._id.toString(), role: user.role });

    const response = successResponse({
      message: "Registration completed successfully",
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    (response as NextResponse).cookies.set(AUTH_COOKIE_NAME, authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("complete-registration error:", err);
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}