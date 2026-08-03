// app/api/payment/jazzcash/route.js
// Stub for JazzCash payment initiation. Replace the TODO with JazzCash's actual
// API integration (their docs require a merchant ID, password, and hashed request).

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

    // TODO: call JazzCash's payment API here with order.total, get back a redirect URL / transaction reference

    return errorResponse("JazzCash integration not yet configured.", 501);
  } catch (err) {
    console.error("jazzcash payment error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}