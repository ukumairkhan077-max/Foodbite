// app/api/webhook/stripe/route.js
// Receives Stripe's payment confirmation. Signature verification is what stops
// anyone from forging a "payment succeeded" call directly to this URL — never skip it.

import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text(); // MUST be the raw, unparsed body — signature check fails otherwise

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return errorResponse("Invalid signature.", 400);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      await dbConnect();
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paymentReference: paymentIntent.id,
      });
    }
  }

  return successResponse({ received: true });
}
