// app/api/coupons/route.js
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

// GET /api/coupons — admin only, list all coupons
export async function GET(req) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return successResponse({ coupons });
  } catch (err) {
    console.error("get coupons error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// POST /api/coupons — admin only, create a new coupon
export async function POST(req) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const body = await req.json();
    const { code, discountType, value, expiresAt } = body;

    if (!code || !discountType || value == null || !expiresAt) {
      return errorResponse("Code, discountType, value, and expiresAt are required.");
    }

    await dbConnect();

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return errorResponse("A coupon with this code already exists.", 409);

    const coupon = await Coupon.create({ ...body, code: code.toUpperCase() });
    return successResponse({ message: "Coupon created", coupon }, 201);
  } catch (err) {
    console.error("create coupon error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
