// app/api/coupons/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const updates = await req.json();
    if (updates.code) updates.code = updates.code.toUpperCase();

    await dbConnect();
    const coupon = await Coupon.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!coupon) return errorResponse("Coupon not found.", 404);

    return successResponse({ message: "Coupon updated", coupon });
  } catch (err) {
    console.error("update coupon error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();
    const coupon = await Coupon.findByIdAndDelete(params.id);
    if (!coupon) return errorResponse("Coupon not found.", 404);

    return successResponse({ message: "Coupon deleted" });
  } catch (err) {
    console.error("delete coupon error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}