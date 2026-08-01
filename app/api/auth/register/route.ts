// app/api/auth/register/route.ts
// STEP 1 of customer signup: submit phone number -> receive OTP.
// Also doubles as "resend OTP" if called again before verification.

import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { isValidPkPhone, normalizePhone } from "@/utils/validators";
import { generateOtp, hashOtp, getOtpExpiry, sendOtpSms } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !isValidPkPhone(phone)) {
      return errorResponse("Please provide a valid Pakistani phone number, e.g. 03001234567");
    }

    const normalizedPhone = normalizePhone(phone);
    await dbConnect();

    let user = await User.findOne({ phone: normalizedPhone });

    if (user && user.isVerified && user.isProfileComplete) {
      return errorResponse("This phone number is already registered. Please login instead.", 409);
    }

    if (!user) {
      user = new User({ phone: normalizedPhone, role: "CUSTOMER" });
    }

    const otp = generateOtp();
    user.otp = {
      codeHash: await hashOtp(otp),
      expiresAt: getOtpExpiry(),
      attempts: 0,
    };
    await user.save();

    await sendOtpSms(normalizedPhone, otp);

    return successResponse({ message: "OTP sent successfully", phone: normalizedPhone });
  } catch (err: any) {
    console.error("register error:", err);
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}