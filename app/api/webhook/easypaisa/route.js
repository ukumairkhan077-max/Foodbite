// app/api/webhook/easypaisa/route.js
// Structured the same way as the JazzCash webhook — verify first, trust second.
// Fill in the actual verification method once you have Easypaisa's callback docs.

import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(req) {
  try {
    const body = await req.json();

    // TODO: verify the callback's authenticity per Easypaisa's docs before trusting `body`
    // (likely a hash/signature check similar to JazzCash's, or comes from their encrypted response).

    const { orderId, transactionStatus, transactionId } = body;
    if (!orderId) return errorResponse("orderId missing from webhook payload.");

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) return errorResponse("Order not found.", 404);

    if (transactionStatus === "SUCCESS") {
      order.isPaid = true;
      order.paymentReference = transactionId;
      await order.save();
    }

    return successResponse({ received: true });
  } catch (err) {
    console.error("easypaisa webhook error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
