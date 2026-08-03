// app/api/webhook/route.js
// Receives payment confirmation callbacks from JazzCash/Easypaisa/Stripe.
// Each provider has its own payload shape and signature-verification method —
// verify the signature/secret before trusting anything in the body.

import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(req) {
  try {
    const body = await req.json();

    // TODO: verify the webhook signature according to the specific provider's docs
    // before trusting `body`.

    const { orderId, paymentReference, status } = body;
    if (!orderId) return errorResponse("orderId missing from webhook payload.");

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) return errorResponse("Order not found.", 404);

    if (status === "SUCCESS" || status === "success" || status === "completed") {
      order.isPaid = true;
      order.paymentReference = paymentReference;
      await order.save();
    }

    return successResponse({ message: "Webhook processed" });
  } catch (err) {
    console.error("webhook error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}