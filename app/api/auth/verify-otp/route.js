// app/api/auth/verify-otp/route.js
// Firebase already confirmed the OTP client-side by the time this route is called.
// We just verify the ID token it issued, pull out the phone number, and either find
// or create the matching User — then hand back the same tempToken as before so the
// rest of the signup flow (complete-registration) doesn't need to change at all.

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyFirebaseToken } from "@/lib/firebaseAdmin";
import { signTempToken } from "@/lib/auth";

// Converts Firebase's E.164 format ("+923001234567") to our stored format ("03001234567")
function fromE164(e164Phone) {
  return "0" + e164Phone.slice(3);
}

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return errorResponse("Missing verification token.");

    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken);
    } catch (err) {
      console.error("Firebase token verification failed:", err.message);
      return errorResponse("Verification failed. Please try again.", 401);
    }

    if (!decoded.phone_number) {
      return errorResponse("No phone number found on this verification.", 400);
    }

    const normalizedPhone = fromE164(decoded.phone_number);
    await dbConnect();

    let user = await User.findOne({ phone: normalizedPhone });

    if (user && user.isVerified && user.isProfileComplete) {
      return errorResponse("This phone number is already registered. Please login instead.", 409);
    }

    if (!user) {
      user = new User({ phone: normalizedPhone, role: "CUSTOMER" });
    }

    user.isVerified = true; // Firebase already proved they own this number
    await user.save();

    const tempToken = signTempToken({ userId: user._id.toString(), purpose: "complete-registration" });

    return successResponse({
      message: "Phone verified successfully",
      tempToken,
      isProfileComplete: user.isProfileComplete,
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
