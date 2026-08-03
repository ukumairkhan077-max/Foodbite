// app/api/payment/stripe/route.js
// Stub for card payments via Stripe. Once you `npm install stripe`, initialize it
// with process.env.STRIPE_SECRET_KEY and create a PaymentIntent here.

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

    // TODO: const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(order.total * 100),
    //   currency: "pkr",
    //   metadata: { orderId: order._id.toString() },
    // });
    // return successResponse({ clientSecret: paymentIntent.client_secret });

    return errorResponse("Stripe integration not yet configured.", 501);
  } catch (err) {
    console.error("stripe payment error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}