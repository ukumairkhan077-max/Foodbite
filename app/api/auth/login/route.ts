// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { isValidEmail } from "@/utils/validators";
import { comparePassword, signAuthToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !isValidEmail(email)) return errorResponse("Please provide a valid email address.");
    if (!password) return errorResponse("Password is required.");

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !user.password) return errorResponse("Invalid email or password.", 401);
    if (!user.isActive) return errorResponse("This account has been deactivated. Contact support.", 403);

    if (user.role === "CUSTOMER" && !user.isProfileComplete) {
      return errorResponse("Please complete your registration first.", 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return errorResponse("Invalid email or password.", 401);

    const authToken = signAuthToken({ userId: user._id.toString(), role: user.role });

    const response = successResponse({
      message: "Login successful",
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
    console.error("login error:", err);
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}