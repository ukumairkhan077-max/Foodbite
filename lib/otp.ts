// lib/otp.ts
import bcrypt from "bcryptjs";

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const MAX_OTP_ATTEMPTS = 5;

export function generateOtp(): string {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

// Stub — replace with real SMS provider (Twilio, Telesign, local PK SMS gateway, etc.)
export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return;
  }

  // Example shape for a real provider call:
  // await fetch("https://api.smsprovider.com/send", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${process.env.SMS_API_KEY}` },
  //   body: JSON.stringify({ to: phone, message: `Your verification code is ${otp}` }),
  // });

  throw new Error("SMS provider not configured. Set up sendOtpSms() in lib/otp.ts");
}