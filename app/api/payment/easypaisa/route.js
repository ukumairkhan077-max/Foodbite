// app/api/payment/easypaisa/route.js
// Stub for Easypaisa payment initiation — same pattern as JazzCash.

import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const { orderId } = await req.json();
    if (!orderId) return errorResponse("orderId is required.");

    await dbConnect();
    const order = await Order.findOne({ _id: orderId, user: authUser.userId });
    if (!order) return errorResponse("Order not found.", 404);

    // TODO: call Easypaisa's payment API here with order.total, get back a redirect URL / transaction reference

    return errorResponse("Easypaisa integration not yet configured.", 501);
  } catch (err) {
    console.error("easypaisa payment error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}