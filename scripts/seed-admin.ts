// scripts/seed-admin.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../lib/dbConnect";
import User from "../models/User";
import { hashPassword } from "../lib/auth";

async function seedAdmin() {
  const name = process.env.SEED_ADMIN_NAME || "Super Admin";
  const email = process.env.SEED_ADMIN_EMAIL;
  const phone = process.env.SEED_ADMIN_PHONE;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !phone || !password) {
    console.error("Set SEED_ADMIN_EMAIL, SEED_ADMIN_PHONE, and SEED_ADMIN_PASSWORD in .env.local before running this script.");
    process.exit(1);
  }

  await dbConnect();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("An admin with this email already exists. Aborting.");
    process.exit(0);
  }

  await User.create({
    name,
    email: email.toLowerCase().trim(),
    phone,
    password: await hashPassword(password),
    role: "ADMIN",
    isVerified: true,
    isProfileComplete: true,
  });

  console.log(`First admin created: ${email}`);
  process.exit(0);
}

seedAdmin();