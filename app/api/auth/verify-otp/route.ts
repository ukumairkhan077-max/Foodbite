// app/api/auth/verify-otp/route.ts
import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { normalizePhone } from "@/utils/validators";
import { compareOtp, MAX_OTP_ATTEMPTS } from "@/lib/otp";
import { signTempToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return errorResponse("Phone and OTP are required.");
    }

    const normalizedPhone = normalizePhone(phone);
    await dbConnect();

    const user = await User.findOne({ phone: normalizedPhone }).select("+otp.codeHash +otp.expiresAt +otp.attempts");

    if (!user || !user.otp?.codeHash) {
      return errorResponse("No pending OTP for this number. Please request a new one.", 404);
    }

    if (user.otp.attempts >= MAX_OTP_ATTEMPTS) {
      return errorResponse("Too many incorrect attempts. Please request a new OTP.", 429);
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return errorResponse("OTP has expired. Please request a new one.", 410);
    }

    const isMatch = await compareOtp(otp, user.otp.codeHash);

    if (!isMatch) {
      user.otp.attempts += 1;
      await user.save();
      return errorResponse("Incorrect OTP.");
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const tempToken = signTempToken({ userId: user._id.toString(), purpose: "complete-registration" });

    return successResponse({
      message: "Phone verified successfully",
      tempToken,
      isProfileComplete: user.isProfileComplete,
    });
  } catch (err: any) {
    console.error("verify-otp error:", err);
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}